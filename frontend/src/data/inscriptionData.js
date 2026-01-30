// ROK Inscription Data with stats
// Data extracted from codexhelper.com

// Inscription stats - bonuses per inscription
export const INSCRIPTION_STATS = {
  // Formation bonuses
  "Arch": { na: 5 },
  "Wedge": { skillDamage: 5 },
  "Hollow Square": { allDamage: 2 },
  "Delta": { comboDamage: 10 },
  "Pincer": { smiteDamage: 10 },

  // Basic stat inscriptions (3.5% each)
  "Warcry": { attack: 3.5 },
  "Brutal": { attack: 3.5 },
  "Spiked": { attack: 3.5 },
  "Infamy": { attack: 3.5 },
  "Well Clad": { defense: 3.5 },
  "Armored": { defense: 3.5 },
  "Metallics": { defense: 3.5 },
  "Shielded": { defense: 3.5 },
  "Robust": { health: 3.5 },
  "Fit": { health: 3.5 },
  "Vitality": { health: 3.5 },
  "Hardy": { health: 3.5 },

  // Normal attack inscriptions
  "Onslaught": { na: 1.5 },
  "Warhunger": { na: 1.5 },
  "Striker": { na: 1.5 },
  "Militant": { na: 1.5 },
  "Iron Wall": { na: 1.5 },

  // Counterattack inscriptions
  "Retaliatory": { ca: 2.5 },
  "Alert": { ca: 2.5 },
  "Rebuff": { ca: 2.5 },
  "Resistant": { ca: 2.5 },
  "Evasive_Instrument": { ca: 2.5 },

  // CA + Skill Damage combo
  "Enraged": { ca: 1, skillDamage: 2.5 },
  "Devious": { ca: 1, skillDamage: 2.5 },
  "Brawler": { ca: 1, skillDamage: 2.5 },
  "Daring": { ca: 1, skillDamage: 2.5 },

  // All Damage inscriptions
  "Valiant": { allDamage: 1 },
  "Fearsome": { allDamage: 1 },
  "Warflames": { allDamage: 1 },
  "Elite": { allDamage: 1 },
  "Evasive_Emblem": { allDamage: 1 },
  "Bellicose": { allDamage: 1.07 },
  "Ward": { allDamage: 1.87 },
  "Respite": { allDamage: 1.42 },
  "Strategic": { allDamage: 2 },
  "Desperado": { allDamage: 2 },
  "Assertive": { allDamage: 2 },
  "Cohesive": { allDamage: 0.5 },
  "Pursuer": { allDamage: 0.75 },
  "Rapacious": { allDamage: 1.5 },
  "Watchmen": { allDamage: 1.5 },

  // Normal attack variations
  "Pulverize": { na: 1.42 },
  "Smite": { na: 2 },
  "Requital": { na: 1.78 },
  "Uplifting": { na: 1 },
  "Spirited": { na: 1 },
  "Lineshot": { na: 1 },

  // Attack variations
  "Breaker": { attack: 3.2 },
  "Calm": { attack: 2.3 },

  // Skill damage inscriptions
  "Guarded": { skillDamage: 1.42 },
  "Eclipsed": { skillDamage: 2.5 },
  "Deflecter": { skillDamage: 3 },
  "Furious": { na: 1.5, skillDamage: 4 },

  // CA variations
  "Brave": { ca: 5 },
  "Ballistics": { ca: 1.5 },
  "Enduring": { ca: 3 },
  "Guardians": { ca: 2 },
  "Counterer": { ca: 3 },
  "Artisan": { ca: 1, skillDamage: 3 },

  // Empty or special
  "Embattled": {},
  "Vengeful": {},
  "Siegework": {},
  "Sentries": {},

  // Arch formation exclusives
  "Destructive": { na: 3.5, skillDamage: -3.5, smiteDamage: -7, comboDamage: -3.5 },
  "Straight to the Point": { na: 5.78, skillDamage: -2.1 },
  "Invincible": { na: 4.5, skillDamage: 5 },
  "Fearless": { na: 8 },
  "Battle Ready": { na: 5, skillDamage: -3.5, smiteDamage: -6, comboDamage: -3.5 },
  "Even-Keeled": { allDamage: 1.07, na: 1.5, skillDamage: 2.1 },
  "Unswerving": { skillDamage: 4 },
  "Forceful": { na: 3 },

  // Wedge formation exclusives
  "Hunter": { skillDamage: 7 },
  "Unstoppable": { skillDamage: 6 },
  "Balanced": { na: 3.5, skillDamage: 4 },
  "Intrepid": { skillDamage: 10 },
  "Crazed": { skillDamage: 2.5 },
  "Boiling Blood": { skillDamage: 3.15 },
  "Defiant": { na: 3 },
  "Focus Fire": { skillDamage: 4 },

  // Hollow Square formation exclusives
  "Cocoon": { skillDamage: 5 },
  "Inviolable": { allDamage: 3.75 },
  "Crowned": { allDamage: 2.5 },
  "Rounded": { allDamage: 5 },
  "Self Defense": {},
  "Aegis": { allDamage: 1.875 },
  "Reinforced": {},
  "Tenacious": { allDamage: 2 },

  // Delta formation exclusives
  "Thrasher": { comboDamage: 7.5 },
  "Butterfly Effect": { comboDamage: 3.5, allDamage: 2.5 },
  "Steelskin": { allDamage: 7.5 },
  "Flurry": { comboDamage: 8 },
  "Pummeler": { comboDamage: 4 },
  "Causative": { comboDamage: 1.5, allDamage: 1.2 },
  "Determined": { allDamage: 1.5 },
  "Relentless": { comboDamage: 3.5 },

  // Pincer formation exclusives
  "Toppler": { smiteDamage: 10 },
  "Demolisher": { attack: 3.75, smiteDamage: 5 },
  "Airtight": { allDamage: 3.75 },
  "Thundering": { smiteDamage: 10 },
  "Imploder": { defense: 5 },
  "Raider": { smiteDamage: 3.75 },
  "Hardheaded": {},
  "Rattling": { smiteDamage: 4 },
};

// Formation data
export const FORMATIONS = [
  { id: 'arch', name: 'Arch', bonus: { na: 5 } },
  { id: 'wedge', name: 'Wedge', bonus: { skillDamage: 5 } },
  { id: 'hollow_square', name: 'Hollow Square', bonus: { allDamage: 2 } },
  { id: 'delta', name: 'Delta', bonus: { comboDamage: 10 } },
  { id: 'pincer', name: 'Pincer', bonus: { smiteDamage: 10 } },
];

// Tier colors
export const TIER_COLORS = {
  'S': '#ffd700', // Gold
  'A': '#c084fc', // Purple
  'B': '#60a5fa', // Blue
  'C': '#94a3b8', // Gray/White
};

// Calculate total inscription stats
export function calculateInscriptionStats(selectedInscriptions, formation) {
  const stats = {
    attack: 0,
    defense: 0,
    health: 0,
    allDamage: 0,
    skillDamage: 0,
    na: 0, // Normal attack damage
    ca: 0, // Counterattack damage
    smiteDamage: 0,
    comboDamage: 0,
  };

  // Add formation bonus
  if (formation) {
    const formationData = FORMATIONS.find(f => f.id === formation || f.name.toLowerCase().replace(' ', '_') === formation);
    if (formationData?.bonus) {
      Object.entries(formationData.bonus).forEach(([stat, value]) => {
        if (stats.hasOwnProperty(stat)) {
          stats[stat] += value;
        }
      });
    }
  }

  // Add inscription bonuses
  if (selectedInscriptions && Array.isArray(selectedInscriptions)) {
    selectedInscriptions.forEach(inscriptionName => {
      const inscStats = INSCRIPTION_STATS[inscriptionName];
      if (inscStats) {
        Object.entries(inscStats).forEach(([stat, value]) => {
          if (stats.hasOwnProperty(stat)) {
            stats[stat] += value;
          }
        });
      }
    });
  }

  return stats;
}

// Get all inscriptions for a formation and slot
export function getInscriptionsForSlot(formation, slot, inscriptions) {
  return inscriptions.filter(insc =>
    insc.formation === formation && insc.slot === slot
  );
}

// Format stat name for display
export function formatStatName(statKey) {
  const names = {
    attack: 'Attack',
    defense: 'Defense',
    health: 'Health',
    allDamage: 'All Damage',
    skillDamage: 'Skill Damage',
    na: 'Normal Attack',
    ca: 'Counterattack',
    smiteDamage: 'Smite Damage',
    comboDamage: 'Combo Damage',
  };
  return names[statKey] || statKey;
}
