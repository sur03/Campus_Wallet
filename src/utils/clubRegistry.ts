/**
 * Club Registry
 * ==============
 * 
 * Off-chain mapping of wallet addresses to club names.
 * This is for UX ONLY - does NOT control funds or approve campaigns.
 */

interface ClubInfo {
    clubName: string;
    verified: boolean;
    description?: string;
    logo?: string;
    registeredAt: number;
}

interface ClubRegistry {
    [walletAddress: string]: ClubInfo;
}

// In-memory registry
// In production, use Firebase/Supabase
let registry: ClubRegistry = {};

/**
 * Load registry from storage
 */
function loadRegistry(): void {
    try {
        const stored = localStorage.getItem('clubRegistry');
        if (stored) {
            registry = JSON.parse(stored);
            console.log(`📚 Loaded ${Object.keys(registry).length} clubs from registry`);
        }
    } catch (error) {
        console.error('Error loading club registry:', error);
        registry = {};
    }
}

/**
 * Save registry to storage
 */
function saveRegistry(): void {
    try {
        localStorage.setItem('clubRegistry', JSON.stringify(registry));
    } catch (error) {
        console.error('Error saving club registry:', error);
    }
}

// Load on module initialization
loadRegistry();

/**
 * Get club name for a wallet address
 */
export function getClubName(walletAddress: string): string | null {
    const club = registry[walletAddress];
    return club ? club.clubName : null;
}

/**
 * Check if club is verified
 */
export function isVerifiedClub(walletAddress: string): boolean {
    const club = registry[walletAddress];
    return club ? club.verified : false;
}

/**
 * Get full club info
 */
export function getClubInfo(walletAddress: string): ClubInfo | null {
    return registry[walletAddress] || null;
}

/**
 * Register a new club
 */
export function registerClub(
    walletAddress: string,
    clubName: string,
    description?: string,
    logo?: string
): void {
    registry[walletAddress] = {
        clubName,
        verified: false, // Verification requires manual approval
        description,
        logo,
        registeredAt: Math.floor(Date.now() / 1000),
    };

    saveRegistry();
    console.log(`✅ Club registered: ${clubName} (${walletAddress})`);
}

/**
 * Verify a club (admin only)
 */
export function verifyClub(walletAddress: string): void {
    if (registry[walletAddress]) {
        registry[walletAddress].verified = true;
        saveRegistry();
        console.log(`✅ Club verified: ${walletAddress}`);
    }
}

/**
 * Unverify a club (admin only)
 */
export function unverifyClub(walletAddress: string): void {
    if (registry[walletAddress]) {
        registry[walletAddress].verified = false;
        saveRegistry();
        console.log(`⚠️ Club unverified: ${walletAddress}`);
    }
}

/**
 * Update club info
 */
export function updateClubInfo(
    walletAddress: string,
    updates: Partial<Omit<ClubInfo, 'registeredAt'>>
): void {
    if (registry[walletAddress]) {
        registry[walletAddress] = {
            ...registry[walletAddress],
            ...updates,
        };
        saveRegistry();
        console.log(`✅ Club info updated: ${walletAddress}`);
    }
}

/**
 * Get all registered clubs
 */
export function getAllClubs(): ClubRegistry {
    return { ...registry };
}

/**
 * Get all verified clubs
 */
export function getVerifiedClubs(): ClubRegistry {
    const verified: ClubRegistry = {};
    for (const [address, info] of Object.entries(registry)) {
        if (info.verified) {
            verified[address] = info;
        }
    }
    return verified;
}

/**
 * Delete club from registry
 */
export function deleteClub(walletAddress: string): void {
    delete registry[walletAddress];
    saveRegistry();
    console.log(`🗑️ Club deleted: ${walletAddress}`);
}

/**
 * Clear all clubs (for testing)
 */
export function clearRegistry(): void {
    registry = {};
    localStorage.removeItem('clubRegistry');
    console.log('🗑️ Club registry cleared');
}

/**
 * Seed registry with demo clubs (for testing)
 */
export function seedDemoClubs(): void {
    const demoClubs = [
        {
            address: 'DEMO1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            name: 'Computer Science Club',
            description: 'Building the future of technology',
            verified: true,
        },
        {
            address: 'DEMO2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            name: 'Robotics Society',
            description: 'Innovating with robots and automation',
            verified: true,
        },
        {
            address: 'DEMO3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            name: 'Blockchain Club',
            description: 'Exploring decentralized technologies',
            verified: false,
        },
    ];

    demoClubs.forEach(club => {
        registerClub(club.address, club.name, club.description);
        if (club.verified) {
            verifyClub(club.address);
        }
    });

    console.log('✅ Demo clubs seeded');
}
