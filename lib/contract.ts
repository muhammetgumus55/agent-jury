/**
 * lib/contract.ts
 * Web3 helpers for connecting MetaMask and saving verdicts on Monad Testnet.
 */

import { ethers } from 'ethers';

/* ─── Constants ─────────────────────────────────────────────────────── */

export const CONTRACT_ADDRESS = '0x9429A166CCE36262A9Dec2BE90C43AE685fB415B';

export const CONTRACT_ABI = [
    {
        type: 'function',
        name: 'saveVerdict',
        inputs: [
            { name: 'caseHash', type: 'bytes32' },
            { name: 'feasibility', type: 'uint8' },
            { name: 'innovation', type: 'uint8' },
            { name: 'risk', type: 'uint8' },
            { name: 'finalScore', type: 'uint8' },
            { name: 'shortVerdict', type: 'string' },
        ],
        outputs: [{ name: 'id', type: 'uint256' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'getVerdictCount',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'event',
        name: 'VerdictSaved',
        inputs: [
            { name: 'id', type: 'uint256', indexed: true },
            { name: 'finalScore', type: 'uint8', indexed: false },
        ],
        anonymous: false,
    },
] as const;

/* ─── Monad Testnet chain params ────────────────────────────────────── */

const MONAD_CHAIN = {
    chainId: '0x279f',          // 10143 decimal
    chainName: 'Monad Testnet',
    nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
    rpcUrls: ['https://testnet-rpc.monad.xyz/'],
    blockExplorerUrls: ['https://testnet.monadexplorer.com/'],
};

/* ─── Types ─────────────────────────────────────────────────────────── */

export interface AgentResult {
    score: number;
    pros: string[];
    cons: string[];
}

export interface EvalResults {
    feasibility: AgentResult;
    innovation: AgentResult;
    risk: AgentResult;
}

/* ─── connectWallet ─────────────────────────────────────────────────── */

/**
 * Requests MetaMask access, adds/switches to Monad Testnet, and returns the
 * connected address.
 */
export async function connectWallet(): Promise<string> {
    if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask bulunamadı — lütfen tarayıcı eklentisini yükleyin.');
    }

    // Add/switch chain first (wallet_addEthereumChain handles "already added")
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: MONAD_CHAIN.chainId }],
        });
    } catch (switchErr: unknown) {
        // 4902 = chain not added yet
        if ((switchErr as { code?: number }).code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [MONAD_CHAIN],
            });
        } else {
            throw switchErr;
        }
    }

    // Request accounts
    const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
    })) as string[];

    if (!accounts || accounts.length === 0) {
        throw new Error('Cüzdan bağlantısı reddedildi.');
    }

    return accounts[0];
}

/* ─── saveVerdictToChain ────────────────────────────────────────────── */

export interface SaveResult {
    txHash: string;
    verdictId: bigint;
}

/**
 * Connects the wallet, calls `saveVerdict` on the AgentJury contract, waits
 * for 1 confirmation, and returns the transaction hash + on-chain verdict ID.
 */
export async function saveVerdictToChain(
    caseText: string,
    results: EvalResults,
    finalScore: number,
    shortVerdict: string,
): Promise<SaveResult> {
    await connectWallet();

    if (!window.ethereum) throw new Error('MetaMask bulunamdı.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // keccak256 hash of the raw case text
    const caseHash = ethers.keccak256(ethers.toUtf8Bytes(caseText));

    const feasibility = Math.round(results.feasibility.score);
    const innovation = Math.round(results.innovation.score);
    const risk = Math.round(results.risk.score);
    const score = Math.round(finalScore);

    // Call the contract
    const tx: ethers.ContractTransactionResponse = await contract.saveVerdict(
        caseHash,
        feasibility,
        innovation,
        risk,
        score,
        shortVerdict,
    );

    // Wait for 1 on-chain confirmation
    const receipt = await tx.wait(1);
    if (!receipt) throw new Error('İşlem onayı alınamadı.');

    // Parse VerdictSaved event to get on-chain id
    const iface = new ethers.Interface(CONTRACT_ABI as ethers.InterfaceAbi);
    let verdictId = BigInt(0);
    for (const log of receipt.logs) {
        try {
            const parsed = iface.parseLog(log);
            if (parsed?.name === 'VerdictSaved') {
                verdictId = parsed.args[0] as bigint;
                break;
            }
        } catch {
            // Non-matching log, skip
        }
    }

    return { txHash: receipt.hash, verdictId };
}
