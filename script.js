class Resource {
    constructor(name, amount, perSecond) {
        this.name = name;
        this.amount = amount;
        this.perSecond = perSecond;
    }

    addAmount(amount) {
        this.amount += amount;
        if (this.amount > 1000000000) {
            this.amount = 1000000000;
            if (gameData.gameWon === false) {
                gameData.gameWon = true;
                document.getElementById("wonMessage").innerHTML = "Complete!";
                alert("You won!");
            }
        }
    }
}

class Building {
    constructor(name, originalManaCost, manaPerSecond, costCreep, amount = 0) {
        this.name = name;
        this.originalManaCost = originalManaCost;
        this.manaPerSecond = manaPerSecond;
        this.costCreep = costCreep;
        this.amount = amount;
    }

    calculateCostCreep() {
        return Math.ceil(this.originalManaCost * this.costCreep ** this.amount);
    }

    build() {
        const currentCost = this.calculateCostCreep();
        if (currentCost <= gameData.mana.amount) {
            this.amount += 1;
            gameData.mana.addAmount(-currentCost);

            gameData.mana.perSecond += this.manaPerSecond;
            updateUI();
        }
    }
}

class Upgrade {
    constructor(name, manaCost, effect, purchased = false) {
        this.name = name;
        this.manaCost = manaCost;
        this.effect = effect;
        this.purchased = purchased;
    }

    purchase() {
        if (gameData.mana.amount >= this.manaCost && !this.purchased) {
            this.purchased = true;
            gameData.mana.addAmount(-this.manaCost);
            this.effect()
            updateUI();
        }
    }
}

var gameData = {
    gameWon: false,
    mana: new Resource("Mana", 0, 0),
    manaPerClick: 1,
    manaMultiplier: 1,
    manaFromManaRegeneration: 0,
    manaFromManaExplosion: 0,

    buildings: {
        magicWand: new Building("Magic Wand", 10, 1, 1.2),
        crystalCave: new Building("Crystal Cave", 100, 10, 1.3),
        wizardTower: new Building("Wizard Tower", 1000, 100, 1.4),
        enchantedForest: new Building("Enchanted Forest", 10000, 1000, 1.5),
        alchemyLab: new Building("Alchemy Lab", 100000, 10000, 1.75),
        dragonLair: new Building("Dragon Lair", 1000000, 100000, 2),
    },

    upgrades: {
        manaChanneling: new Upgrade("Mana Channeling", 500, function () {
            gameData.manaMultiplier *= 1.05;
        }),
        manaAmplification: new Upgrade("Mana Amplification", 2500, function () {
            gameData.manaMultiplier *= 1.1;
        }),
        manaMultiplication: new Upgrade("Mana Multiplication", 10000, function () {
            gameData.manaMultiplier *= 1.2;
        }),
        manaRegeneration: new Upgrade("Mana Regeneration", 25000, function () {
            gameData.manaFromManaRegeneration = 0.01;
        }),
        manaFusion: new Upgrade("Mana Fusion", 100000, function () {
            gameData.manaMultiplier *= 1.5;
        }),
        manaExplosion: new Upgrade("Mana Explosion", 250000, function () {
            gameData.manaFromManaExplosion = 0.01;
        }),
        manaAscension: new Upgrade("Mana Ascension", 500000, function () {
            gameData.manaMultiplier *= 2;
        }),
        manaInfinity: new Upgrade("Mana Infinity", 1000000, function () {
            gameData.manaMultiplier *= 11;
        })
    }
};

function gainMana() {
    const manaFromManaExplosion = gameData.manaFromManaExplosion * gameData.mana.amount;
    gameData.mana.addAmount(Math.ceil(gameData.manaPerClick + manaFromManaExplosion));
    updateUI();
}

function updateUI() {
    // Mana
    const manaFromManaExplosion = gameData.manaFromManaExplosion * gameData.mana.amount;
    document.getElementById("manaClickAmount").innerHTML = Math.ceil(gameData.manaPerClick + manaFromManaExplosion).toLocaleString();
    document.getElementById("manaAmount").innerHTML = gameData.mana.amount.toLocaleString();
    const manaFromManaRegeneration = gameData.manaFromManaRegeneration * gameData.mana.amount;
    document.getElementById("manaPerSecond").innerHTML = Math.ceil(gameData.mana.perSecond * gameData.manaMultiplier + manaFromManaRegeneration).toLocaleString();

    // Buildings
    for (let buildingKey in gameData.buildings) {
        const buildingValue = gameData.buildings[buildingKey];
        document.getElementById(buildingKey + "Amount").innerHTML = buildingValue.amount.toLocaleString();
        document.getElementById(buildingKey + "ManaCost").innerHTML = buildingValue.calculateCostCreep().toLocaleString();
        document.getElementById(buildingKey + "Effect").innerHTML = Math.ceil(buildingValue.manaPerSecond * gameData.manaMultiplier).toLocaleString();
    }

    // Upgrades
    for (let upgradeKey in gameData.upgrades) {
        const upgradeValue = gameData.upgrades[upgradeKey];
        document.getElementById(upgradeKey + "Purchased").innerHTML = upgradeValue.purchased;
    }
}

function incrementMana() {
    const manaFromManaRegeneration = gameData.manaFromManaRegeneration * gameData.mana.amount;
    gameData.mana.addAmount(Math.ceil(gameData.mana.perSecond * gameData.manaMultiplier + manaFromManaRegeneration));
}

updateUI();
var mainGameLoop = window.setInterval(function () {
    incrementMana();
    updateUI();
}, 1000);