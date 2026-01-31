// ============================================
// plugins/rpg/shop.js (VERSIÓN CORREGIDA)
// ============================================
import { RESOURCE_SYSTEM } from '../../lib/rpg/resource-system.js';

const handler = async (m, { conn, usedPrefix, args }) => {
    if (!global.db.data.chats[m.chat].economy && m.isGroup) {
        return m.reply(`🚫 *Economía desactivada*\n\nUn *administrador* puede activarla con:\n» *${usedPrefix}economy on*`);
    }

    const user = global.db.data.users[m.sender];
    const category = args[0]?.toLowerCase() || 'main';
    const action = args[1]?.toLowerCase();
    const item = args[2]?.toLowerCase();

    // Inicializar usuario si no existe
    if (!user) {
        global.db.data.users[m.sender] = {
            coin: 1000,
            bank: 0,
            health: 100,
            inventory: {
                resources: {},
                tools: { pickaxe: 'basic', axe: 'basic', fishingRod: 'basic' },
                durability: { pickaxe: 100, axe: 100, fishingRod: 100 }
            }
        };
    }

    if (!user.inventory) {
        user.inventory = {
            resources: {},
            tools: { pickaxe: 'basic', axe: 'basic', fishingRod: 'basic' },
            durability: { pickaxe: 100, axe: 100, fishingRod: 100 }
        };
    }

    // Inicializar monedas si no existen
    user.coin = user.coin || 0;
    user.bank = user.bank || 0;

    let text = `╭━━━━━━━━━━━━━━━━━━━━━╮
┃      🛒 *TIENDA RPG* 🛒
┃━━━━━━━━━━━━━━━━━━━━━┃
💳 *Saldo disponible:* ¥${user.coin.toLocaleString()}
🏦 *Banco:* ¥${user.bank.toLocaleString()}
💰 *Total:* ¥${(user.coin + user.bank).toLocaleString()}\n\n`;

    // MENÚ PRINCIPAL
    if (category === 'main' || category === 'tienda') {
        text += `📌 *CATEGORÍAS DISPONIBLES:*\n\n`;
        text += `🛠️  *Herramientas:* ${usedPrefix}shop tools\n`;
        text += `   Comprar picos, hachas y cañas de pescar\n\n`;
        text += `🔧  *Reparación:* ${usedPrefix}shop repair\n`;
        text += `   Reparar herramientas desgastadas\n\n`;
        text += `💰  *Vender Recursos:* ${usedPrefix}shop sell\n`;
        text += `   Vender recursos por dinero\n\n`;
        text += `📦  *Recursos (Comprar):* ${usedPrefix}shop buy\n`;
        text += `   Comprar recursos directamente\n\n`;
        text += `🎁  *Items Especiales:* ${usedPrefix}shop special\n`;
        text += `   Items únicos y especiales\n\n`;
        text += `📊  *Info Herramientas:* ${usedPrefix}shop info\n`;
        text += `   Ver estadísticas de herramientas`;
    }

    // COMPRAR HERRAMIENTAS
    else if (category === 'tools' || category === 'herramientas') {
        text += `🛠️ *HERRAMIENTAS DISPONIBLES*\n\n`;

        // Picos
        text += `⛏️ *PICOS DE MINERÍA:*\n`;
        for (const [id, tool] of Object.entries(RESOURCE_SYSTEM.TOOLS.PICKAXES)) {
            const owned = user.inventory?.tools?.pickaxe === id;
            const currentDurability = user.inventory?.durability?.pickaxe || 100;
            const canAfford = user.coin >= tool.price;

            text += `▸ ${tool.emoji} *${tool.name}*\n`;
            text += `   Precio: ${canAfford ? '✅' : '❌'} ¥${tool.price.toLocaleString()}\n`;
            text += `   Nivel: ${'⭐'.repeat(tool.level)} (${tool.level})\n`;
            text += `   Eficiencia: ${tool.efficiency}x\n`;
            text += `   Durabilidad: ${tool.durability}\n`;
            text += `   Estado: ${owned ? `✅ TUYA (${currentDurability}%)` : '❌ NO COMPRADA'}\n`;
            text += `   Comando: ${usedPrefix}shop comprar pico ${id}\n\n`;
        }

        // Hachas
        text += `🪓 *HACHAS DE TALA:*\n`;
        for (const [id, tool] of Object.entries(RESOURCE_SYSTEM.TOOLS.AXES)) {
            const owned = user.inventory?.tools?.axe === id;
            const currentDurability = user.inventory?.durability?.axe || 100;
            const canAfford = user.coin >= tool.price;

            text += `▸ ${tool.emoji} *${tool.name}*\n`;
            text += `   Precio: ${canAfford ? '✅' : '❌'} ¥${tool.price.toLocaleString()}\n`;
            text += `   Nivel: ${'⭐'.repeat(tool.level)} (${tool.level})\n`;
            text += `   Eficiencia: ${tool.efficiency}x\n`;
            text += `   Durabilidad: ${tool.durability}\n`;
            text += `   Estado: ${owned ? `✅ TUYA (${currentDurability}%)` : '❌ NO COMPRADA'}\n`;
            text += `   Comando: ${usedPrefix}shop comprar hacha ${id}\n\n`;
        }

        // Cañas de pescar
        text += `🎣 *CAÑAS DE PESCAR:*\n`;
        for (const [id, tool] of Object.entries(RESOURCE_SYSTEM.TOOLS.FISHING_RODS)) {
            const owned = user.inventory?.tools?.fishingRod === id;
            const currentDurability = user.inventory?.durability?.fishingRod || 100;
            const canAfford = user.coin >= tool.price;

            text += `▸ ${tool.emoji} *${tool.name}*\n`;
            text += `   Precio: ${canAfford ? '✅' : '❌'} ¥${tool.price.toLocaleString()}\n`;
            text += `   Nivel: ${'⭐'.repeat(tool.level)} (${tool.level})\n`;
            text += `   Eficiencia: ${tool.efficiency}x\n`;
            text += `   Durabilidad: ${tool.durability}\n`;
            text += `   Estado: ${owned ? `✅ TUYA (${currentDurability}%)` : '❌ NO COMPRADA'}\n`;
            text += `   Comando: ${usedPrefix}shop comprar caña ${id}\n\n`;
        }

        text += `📌 *Comandos rápidos:*\n`;
        text += `» ${usedPrefix}shop comprar pico [tipo]\n`;
        text += `» ${usedPrefix}shop comprar hacha [tipo]\n`;
        text += `» ${usedPrefix}shop comprar caña [tipo]`;
    }

    // REPARAR HERRAMIENTAS
    else if (category === 'repair' || category === 'reparar') {
        text += `🔧 *REPARAR HERRAMIENTAS*\n\n`;

        const tools = [
            { name: 'pico', display: '⛏️ Pico', type: 'pickaxe' },
            { name: 'hacha', display: '🪓 Hacha', type: 'axe' },
            { name: 'caña', display: '🎣 Caña', type: 'fishingRod' }
        ];

        let hasToolsToRepair = false;

        for (const tool of tools) {
            const durability = user.inventory?.durability?.[tool.type] || 100;
            const cost = Math.floor((100 - durability) * 10);

            if (durability < 100) {
                hasToolsToRepair = true;
                const canAfford = user.coin >= cost;

                text += `▸ ${tool.display}\n`;
                text += `   Durabilidad: ${durability}%\n`;
                text += `   Costo reparación: ${canAfford ? '✅' : '❌'} ¥${cost.toLocaleString()}\n`;
                text += `   Comando: ${usedPrefix}shop reparar ${tool.name}\n\n`;
            }
        }

        if (!hasToolsToRepair) {
            text += `✅ *Todas tus herramientas están al 100% de durabilidad*\n`;
            text += `No necesitas reparar nada en este momento.\n\n`;
        }

        text += `💡 *Consejo:* Repara tus herramientas cuando estén por debajo del 50% para evitar que se rompan durante una actividad.`;
    }

    // VENDER RECURSOS
    else if (category === 'sell' || category === 'vender') {
        text += `💰 *VENDER RECURSOS*\n\n`;

        const resources = user.inventory?.resources || {};

        if (Object.keys(resources).length === 0) {
            text += `📭 *No tienes recursos para vender*\n`;
            text += `Ve a minar, talar o pescar para conseguir recursos:\n`;
            text += `» ${usedPrefix}mine - Para minar\n`;
            text += `» ${usedPrefix}chop - Para talar\n`;
            text += `» ${usedPrefix}fish - Para pescar\n`;
        } else {
            text += `📦 *TUS RECURSOS DISPONIBLES:*\n\n`;

            // Agrupar por categoría
            const miningResources = [];
            const woodResources = [];
            const fishResources = [];

            for (const [id, amount] of Object.entries(resources)) {
                let resourceData = null;
                let categoryType = '';

                // Buscar en minería
                if (RESOURCE_SYSTEM.RESOURCES.MINING[id]) {
                    resourceData = RESOURCE_SYSTEM.RESOURCES.MINING[id];
                    categoryType = 'mining';
                }
                // Buscar en tala
                else if (RESOURCE_SYSTEM.RESOURCES.WOODCUTTING[id]) {
                    resourceData = RESOURCE_SYSTEM.RESOURCES.WOODCUTTING[id];
                    categoryType = 'wood';
                }
                // Buscar en pesca
                else if (RESOURCE_SYSTEM.RESOURCES.FISHING[id]) {
                    resourceData = RESOURCE_SYSTEM.RESOURCES.FISHING[id];
                    categoryType = 'fish';
                }

                if (resourceData) {
                    const totalValue = resourceData.value * amount;
                    const item = {
                        id,
                        name: resourceData.name,
                        emoji: resourceData.emoji,
                        amount,
                        value: resourceData.value,
                        totalValue,
                        rarity: resourceData.rarity
                    };

                    if (categoryType === 'mining') miningResources.push(item);
                    else if (categoryType === 'wood') woodResources.push(item);
                    else if (categoryType === 'fish') fishResources.push(item);
                }
            }

            // Mostrar recursos de minería
            if (miningResources.length > 0) {
                text += `⛏️ *MINERÍA:*\n`;
                miningResources.forEach(resource => {
                    text += `▸ ${resource.emoji} ${resource.name}: ${resource.amount} (¥${resource.totalValue.toLocaleString()})\n`;
                    text += `   Vender todo: ${usedPrefix}shop vender ${resource.id} all\n`;
                    text += `   Vender 10: ${usedPrefix}shop vender ${resource.id} 10\n\n`;
                });
            }

            // Mostrar recursos de tala
            if (woodResources.length > 0) {
                text += `🪵 *TALA:*\n`;
                woodResources.forEach(resource => {
                    text += `▸ ${resource.emoji} ${resource.name}: ${resource.amount} (¥${resource.totalValue.toLocaleString()})\n`;
                    text += `   Vender todo: ${usedPrefix}shop vender ${resource.id} all\n`;
                    text += `   Vender 10: ${usedPrefix}shop vender ${resource.id} 10\n\n`;
                });
            }

            // Mostrar recursos de pesca
            if (fishResources.length > 0) {
                text += `🐟 *PESCA:*\n`;
                fishResources.forEach(resource => {
                    text += `▸ ${resource.emoji} ${resource.name}: ${resource.amount} (¥${resource.totalValue.toLocaleString()})\n`;
                    text += `   Vender todo: ${usedPrefix}shop vender ${resource.id} all\n`;
                    text += `   Vender 10: ${usedPrefix}shop vender ${resource.id} 10\n\n`;
                });
            }

            text += `💡 *Vender múltiples recursos:*\n`;
            text += `» ${usedPrefix}shop vender all - Vender TODO\n`;
            text += `» ${usedPrefix}shop vender common - Vender recursos comunes\n`;
            text += `» ${usedPrefix}shop vender rare - Vender recursos raros`;
        }
    }

    // COMPRAR RECURSOS DIRECTAMENTE
    else if (category === 'buy' || category === 'comprar') {
        text += `📦 *COMPRAR RECURSOS DIRECTAMENTE*\n\n`;
        text += `💎 *RECURSOS DISPONIBLES PARA COMPRA:*\n\n`;

        // Recursos básicos (para crafteo o emergencias)
        const buyableResources = [
            { id: 'stone', name: 'Piedra', emoji: '🪨', price: 20, category: 'mining' },
            { id: 'wood', name: 'Madera', emoji: '🪵', price: 15, category: 'wood' },
            { id: 'fish', name: 'Pescado', emoji: '🐟', price: 25, category: 'fishing' },
            { id: 'iron', name: 'Hierro', emoji: '⚙️', price: 50, category: 'mining' },
            { id: 'gold', name: 'Oro', emoji: '🟡', price: 100, category: 'mining' }
        ];

        buyableResources.forEach(resource => {
            const canAfford = user.coin >= resource.price * 10; // Para 10 unidades
            text += `▸ ${resource.emoji} *${resource.name}*\n`;
            text += `   Precio unitario: ¥${resource.price}\n`;
            text += `   10 unidades: ${canAfford ? '✅' : '❌'} ¥${(resource.price * 10).toLocaleString()}\n`;
            text += `   Comando: ${usedPrefix}shop comprarrecurso ${resource.id} [cantidad]\n\n`;
        });

        text += `⚠️ *Nota:* Comprar recursos es más caro que conseguirlos tú mismo.\n`;
        text += `Recomendado solo para emergencias o crafteos urgentes.`;
    }

    // ITEMS ESPECIALES
    else if (category === 'special' || category === 'especial') {
        text += `🎁 *ITEMS ESPECIALES*\n\n`;

        const specialItems = [
            { 
                id: 'repair_kit', 
                name: 'Kit de Reparación Completo', 
                emoji: '🔧', 
                price: 5000, 
                description: 'Repara TODAS tus herramientas al 100%',
                command: `${usedPrefix}shop comprarespecial repair_kit`
            },
            { 
                id: 'luck_charm', 
                name: 'Amuleto de la Suerte', 
                emoji: '🍀', 
                price: 10000, 
                description: '+20% probabilidad de recursos raros por 24h',
                command: `${usedPrefix}shop comprarespecial luck_charm`
            },
            { 
                id: 'double_rewards', 
                name: 'Poción de Recompensas Dobles', 
                emoji: '🧪', 
                price: 15000, 
                description: 'Recursos x2 por 10 actividades',
                command: `${usedPrefix}shop comprarespecial double_rewards`
            },
            { 
                id: 'character_ticket', 
                name: 'Ticket de Personaje', 
                emoji: '🎫', 
                price: 25000, 
                description: 'Canjeable por un personaje aleatorio',
                command: `${usedPrefix}shop comprarespecial character_ticket`
            }
        ];

        specialItems.forEach(item => {
            const canAfford = user.coin >= item.price;
            text += `▸ ${item.emoji} *${item.name}*\n`;
            text += `   ${item.description}\n`;
            text += `   Precio: ${canAfford ? '✅' : '❌'} ¥${item.price.toLocaleString()}\n`;
            text += `   ${item.command}\n\n`;
        });
    }

    // INFO HERRAMIENTAS
    else if (category === 'info') {
        text += `📊 *INFORMACIÓN DE TUS HERRAMIENTAS*\n\n`;

        const tools = [
            { type: 'pickaxe', name: '⛏️ Pico', data: RESOURCE_SYSTEM.TOOLS.PICKAXES },
            { type: 'axe', name: '🪓 Hacha', data: RESOURCE_SYSTEM.TOOLS.AXES },
            { type: 'fishingRod', name: '🎣 Caña', data: RESOURCE_SYSTEM.TOOLS.FISHING_RODS }
        ];

        tools.forEach(toolInfo => {
            const currentTool = user.inventory?.tools?.[toolInfo.type] || 'basic';
            const toolData = toolInfo.data[currentTool];
            const durability = user.inventory?.durability?.[toolInfo.type] || 100;

            if (toolData) {
                text += `${toolInfo.name}:\n`;
                text += `▸ Nombre: ${toolData.emoji} ${toolData.name}\n`;
                text += `▸ Nivel: ${toolData.level}/5\n`;
                text += `▸ Eficiencia: ${toolData.efficiency}x\n`;
                text += `▸ Durabilidad: ${durability}/${toolData.durability} (${Math.floor((durability/toolData.durability)*100)}%)\n`;
                text += `▸ Estado: ${durability <= 20 ? '⚠️ CRÍTICO' : durability <= 50 ? '🟡 DESGASTADA' : '✅ BUENA'}\n\n`;
            } else {
                text += `${toolInfo.name}: No tienes herramienta equipada\n\n`;
            }
        });

        // Próximas mejoras disponibles
        text += `⬆️ *PRÓXIMAS MEJORAS DISPONIBLES:*\n`;

        tools.forEach(toolInfo => {
            const currentTool = user.inventory?.tools?.[toolInfo.type] || 'basic';
            const currentData = toolInfo.data[currentTool];
            const currentLevel = currentData?.level || 1;

            if (currentLevel < 5) {
                const nextTool = Object.entries(toolInfo.data).find(([id, data]) => data.level === currentLevel + 1);
                if (nextTool) {
                    const [nextId, nextData] = nextTool;
                    text += `▸ ${toolInfo.name}: ${nextData.emoji} ${nextData.name} - ¥${nextData.price.toLocaleString()}\n`;
                }
            }
        });
    }

    // PROCESAR COMPRAS DE HERRAMIENTAS
    if (action === 'comprar' && item) {
        const toolType = args[2]?.toLowerCase(); // pico, hacha, caña
        const toolId = args[3]?.toLowerCase(); // basic, iron, gold, etc.

        if (!toolType || !toolId) {
            return m.reply(`❌ Formato incorrecto. Uso: ${usedPrefix}shop comprar [pico/hacha/caña] [tipo]\nEjemplo: ${usedPrefix}shop comprar pico iron`);
        }

        let toolData = null;
        let targetToolType = '';

        // Determinar tipo de herramienta
        if (toolType === 'pico' || toolType === 'pickaxe') {
            toolData = RESOURCE_SYSTEM.TOOLS.PICKAXES[toolId];
            targetToolType = 'pickaxe';
        } else if (toolType === 'hacha' || toolType === 'axe') {
            toolData = RESOURCE_SYSTEM.TOOLS.AXES[toolId];
            targetToolType = 'axe';
        } else if (toolType === 'caña' || toolType === 'fishingrod') {
            toolData = RESOURCE_SYSTEM.TOOLS.FISHING_RODS[toolId];
            targetToolType = 'fishingRod';
        }

        if (!toolData) {
            return m.reply(`❌ Herramienta "${toolId}" no encontrada. Usa ${usedPrefix}shop tools para ver opciones.`);
        }

        if (user.coin < toolData.price) {
            return m.reply(`💰 No tienes suficiente dinero. Necesitas ¥${toolData.price.toLocaleString()}, tienes ¥${user.coin.toLocaleString()}`);
        }

        // Verificar si ya tiene una mejor o igual
        const currentTool = user.inventory?.tools?.[targetToolType];
        if (currentTool) {
            const currentData = RESOURCE_SYSTEM.TOOLS[targetToolType === 'pickaxe' ? 'PICKAXES' : 
                                                    targetToolType === 'axe' ? 'AXES' : 'FISHING_RODS'][currentTool];
            if (currentData && currentData.level >= toolData.level) {
                return m.reply(`⚠️ Ya tienes ${currentData.emoji} ${currentData.name} (nivel ${currentData.level}).\nNecesitas una herramienta de nivel superior.`);
            }
        }

        // Comprar herramienta
        user.coin -= toolData.price;
        user.inventory.tools[targetToolType] = toolId;
        user.inventory.durability[targetToolType] = toolData.durability;

        await m.reply(`✅ ¡Compra exitosa!\n\n${toolData.emoji} Has comprado *${toolData.name}* por ¥${toolData.price.toLocaleString()}\n💰 Saldo restante: ¥${user.coin.toLocaleString()}\n\n¡Ahora podrás conseguir mejores recursos!`);
        await global.db.write();
        return;
    }

    // PROCESAR REPARACIÓN
    else if (action === 'reparar' && item) {
        const toolTypes = {
            'pico': 'pickaxe',
            'pickaxe': 'pickaxe',
            'hacha': 'axe',
            'axe': 'axe',
            'caña': 'fishingRod',
            'fishingrod': 'fishingRod'
        };

        const toolType = toolTypes[item];
        if (!toolType || !user.inventory?.durability?.[toolType]) {
            return m.reply(`❌ Herramienta no válida. Opciones: pico, hacha, caña`);
        }

        const currentDurability = user.inventory.durability[toolType];
        const repairCost = Math.floor((100 - currentDurability) * 10);

        if (currentDurability >= 100) {
            return m.reply(`✅ Esta herramienta ya está al 100% de durabilidad`);
        }

        if (user.coin < repairCost) {
            return m.reply(`💰 No tienes suficiente dinero. Necesitas ¥${repairCost.toLocaleString()}, tienes ¥${user.coin.toLocaleString()}`);
        }

        user.coin -= repairCost;
        user.inventory.durability[toolType] = 100;

        await m.reply(`🔧 ¡Reparación exitosa!\n\nHas reparado tu ${item} por ¥${repairCost.toLocaleString()}\n💰 Saldo restante: ¥${user.coin.toLocaleString()}\n\n¡Tu herramienta está como nueva!`);
        await global.db.write();
        return;
    }

    // PROCESAR VENTA DE RECURSOS
    else if (action === 'vender' && item) {
        const amountArg = args[3]?.toLowerCase();

        // Vender TODO
        if (item === 'all') {
            const resources = user.inventory?.resources || {};
            if (Object.keys(resources).length === 0) {
                return m.reply(`❌ No tienes recursos para vender`);
            }

            let totalEarned = 0;
            let soldItems = [];

            for (const [id, amount] of Object.entries(resources)) {
                let value = 0;
                // Buscar valor del recurso
                for (const category of Object.values(RESOURCE_SYSTEM.RESOURCES)) {
                    if (category[id]) {
                        value = category[id].value;
                        break;
                    }
                }

                if (value > 0) {
                    const itemValue = value * amount;
                    totalEarned += itemValue;
                    soldItems.push({ id, amount, value: itemValue });
                }
            }

            if (totalEarned === 0) {
                return m.reply(`❌ No se pueden vender tus recursos`);
            }

            // Agregar al tracking diario
            const totalAmount = soldItems.reduce((sum, item) => sum + item.amount, 0);
            user.soldToday = (user.soldToday || 0) + totalAmount;

            user.coin += totalEarned;
            user.inventory.resources = {};

            let soldText = `💰 ¡Venta masiva exitosa!\n\n`;
            soldItems.forEach(item => {
                soldText += `▸ ${item.id}: ${item.amount} → ¥${item.value.toLocaleString()}\n`;
            });
            soldText += `\n💰 Total ganado: ¥${totalEarned.toLocaleString()}\n`;
            soldText += `💰 Saldo actual: ¥${user.coin.toLocaleString()}`;

            await m.reply(soldText);
            await global.db.write();
            return;
        }

        // Vender por rareza
        else if (item === 'common' || item === 'rare' || item === 'epic') {
            const resources = user.inventory?.resources || {};
            let totalEarned = 0;
            let soldItems = [];

            for (const [id, amount] of Object.entries(resources)) {
                let resourceData = null;
                // Buscar recurso
                for (const category of Object.values(RESOURCE_SYSTEM.RESOURCES)) {
                    if (category[id]) {
                        resourceData = category[id];
                        break;
                    }
                }

                if (resourceData && 
                    ((item === 'common' && resourceData.rarity === 'common') ||
                     (item === 'rare' && (resourceData.rarity === 'rare' || resourceData.rarity === 'uncommon')) ||
                     (item === 'epic' && (resourceData.rarity === 'epic' || resourceData.rarity === 'legendary' || resourceData.rarity === 'mythic')))) {

                    const itemValue = resourceData.value * amount;
                    totalEarned += itemValue;
                    soldItems.push({ id, name: resourceData.name, amount, value: itemValue, rarity: resourceData.rarity });
                }
            }

            if (totalEarned === 0) {
                return m.reply(`❌ No tienes recursos de rareza "${item}" para vender`);
            }

            // Agregar al tracking diario
            const totalAmount = soldItems.reduce((sum, item) => sum + item.amount, 0);
            user.soldToday = (user.soldToday || 0) + totalAmount;

            user.coin += totalEarned;
            // Eliminar recursos vendidos
            soldItems.forEach(sold => {
                delete user.inventory.resources[sold.id];
            });

            let soldText = `💰 ¡Venta por rareza exitosa!\n\n`;
            soldText += `▸ Rareza: ${item.toUpperCase()}\n`;
            soldItems.forEach(item => {
                soldText += `▸ ${item.name}: ${item.amount} → ¥${item.value.toLocaleString()}\n`;
            });
            soldText += `\n💰 Total ganado: ¥${totalEarned.toLocaleString()}\n`;
            soldText += `💰 Saldo actual: ¥${user.coin.toLocaleString()}`;

            await m.reply(soldText);
            await global.db.write();
            return;
        }

        // Vender recurso específico
        else {
            let amount = 0;

            if (amountArg === 'all') {
                amount = user.inventory?.resources?.[item] || 0;
            } else {
                amount = parseInt(amountArg) || 1;
            }

            if (!user.inventory?.resources?.[item] || user.inventory.resources[item] < amount) {
                return m.reply(`❌ No tienes suficiente "${item}". Tienes: ${user.inventory?.resources?.[item] || 0}`);
            }

            // Buscar valor del recurso
            let value = 0;
            let resourceName = item;
            for (const category of Object.values(RESOURCE_SYSTEM.RESOURCES)) {
                if (category[item]) {
                    value = category[item].value;
                    resourceName = category[item].name;
                    break;
                }
            }

            if (value === 0) {
                return m.reply(`❌ No se puede vender "${item}"`);
            }

            const totalValue = value * amount;

            // Agregar al tracking diario
            user.soldToday = (user.soldToday || 0) + amount;

            user.coin += totalValue;
            user.inventory.resources[item] -= amount;
            if (user.inventory.resources[item] <= 0) {
                delete user.inventory.resources[item];
            }

            await m.reply(`💰 ¡Venta exitosa!\n\nHas vendido ${amount} ${resourceName} por ¥${totalValue.toLocaleString()}\n💰 Saldo actual: ¥${user.coin.toLocaleString()}`);
            await global.db.write();
            return;
        }
    }

    // COMPRAR RECURSOS DIRECTAMENTE
    else if (action === 'comprarrecurso' && item) {
        const amount = parseInt(args[3]) || 1;

        if (amount < 1) {
            return m.reply(`❌ Cantidad inválida. Mínimo 1`);
        }

        // Lista de recursos comprables
        const buyableResources = {
            'stone': { name: 'Piedra', emoji: '🪨', price: 20 },
            'wood': { name: 'Madera', emoji: '🪵', price: 15 },
            'fish': { name: 'Pescado', emoji: '🐟', price: 25 },
            'iron': { name: 'Hierro', emoji: '⚙️', price: 50 },
            'gold': { name: 'Oro', emoji: '🟡', price: 100 }
        };

        const resource = buyableResources[item];
        if (!resource) {
            return m.reply(`❌ Recurso no disponible para compra. Usa ${usedPrefix}shop buy para ver opciones.`);
        }

        const totalCost = resource.price * amount;

        if (user.coin < totalCost) {
            return m.reply(`💰 No tienes suficiente dinero.\nNecesitas: ¥${totalCost.toLocaleString()}\nTienes: ¥${user.coin.toLocaleString()}`);
        }

        user.coin -= totalCost;
        if (!user.inventory.resources) user.inventory.resources = {};
        user.inventory.resources[item] = (user.inventory.resources[item] || 0) + amount;

        await m.reply(`📦 ¡Compra de recursos exitosa!\n\nHas comprado ${amount} ${resource.emoji} ${resource.name} por ¥${totalCost.toLocaleString()}\n💰 Saldo restante: ¥${user.coin.toLocaleString()}`);
        await global.db.write();
        return;
    }

    // COMPRAR ITEMS ESPECIALES
    else if (action === 'comprarespecial' && item) {
        const specialItems = {
            'repair_kit': { name: 'Kit de Reparación Completo', emoji: '🔧', price: 5000, effect: 'repair_all' },
            'luck_charm': { name: 'Amuleto de la Suerte', emoji: '🍀', price: 10000, effect: 'luck_boost' },
            'double_rewards': { name: 'Poción de Recompensas Dobles', emoji: '🧪', price: 15000, effect: 'double_rewards' },
            'character_ticket': { name: 'Ticket de Personaje', emoji: '🎫', price: 25000, effect: 'character_ticket' }
        };

        const specialItem = specialItems[item];
        if (!specialItem) {
            return m.reply(`❌ Item especial no encontrado. Usa ${usedPrefix}shop special para ver opciones.`);
        }

        if (user.coin < specialItem.price) {
            return m.reply(`💰 No tienes suficiente dinero.\nNecesitas: ¥${specialItem.price.toLocaleString()}\nTienes: ¥${user.coin.toLocaleString()}`);
        }

        user.coin -= specialItem.price;

        // Aplicar efecto del item
        switch(specialItem.effect) {
            case 'repair_all':
                user.inventory.durability.pickaxe = 100;
                user.inventory.durability.axe = 100;
                user.inventory.durability.fishingRod = 100;
                await m.reply(`🔧 ¡Kit de reparación activado!\n\nTodas tus herramientas han sido reparadas al 100%\n💰 Saldo restante: ¥${user.coin.toLocaleString()}`);
                break;

            case 'luck_boost':
                if (!user.buffs) user.buffs = {};
                user.buffs.luck_charm = Date.now() + (24 * 60 * 60 * 1000); // 24 horas
                await m.reply(`🍀 ¡Amuleto de la suerte activado!\n\nTienes +20% de probabilidad de recursos raros por 24 horas\n💰 Saldo restante: ¥${user.coin.toLocaleString()}`);
                break;

            case 'double_rewards':
                if (!user.buffs) user.buffs = {};
                user.buffs.double_rewards = 10; // 10 actividades
                await m.reply(`🧪 ¡Poción de recompensas dobles activada!\n\nRecibirás el doble de recursos en tus próximas 10 actividades\n💰 Saldo restante: ¥${user.coin.toLocaleString()}`);
                break;

            case 'character_ticket':
                if (!user.tickets) user.tickets = {};
                user.tickets.character = (user.tickets.character || 0) + 1;
                await m.reply(`🎫 ¡Ticket de personaje obtenido!\n\nTienes ${user.tickets.character} ticket(s) de personaje\nUsa /canjear ticket para obtener un personaje aleatorio\n💰 Saldo restante: ¥${user.coin.toLocaleString()}`);
                break;
        }

        await global.db.write();
        return;
    }

    text += `\n╰━━━━━━━━━━━━━━━━━━━━━╯\n`;
    text += `🔄 *Actualizado:* ${new Date().toLocaleTimeString()}`;

    await conn.reply(m.chat, text, m);
};

handler.help = ['shop', 'tienda'];
handler.tags = ['rpg'];
handler.command = ['shop', 'tienda'];
handler.group = true;

export default handler;