// SNIPPET_VillageGenerated ("mod_a", () => {
//     LISTENFOR_BuildingComplete({
//         snippet: "bc_key_nether_spreader_built",
//         ownerVillageId: villageId,
//         includeTags: ["pigSpreader"],
//         villageId: villageId,
//         factionName: FACTION_NAME_OBSTACLE
//     })
    
//     LISTENFOR_NonPopCappedEntityDestroyed({
//         snippet: "ed_key_nether_spreader_destroyed",
//         ownerVillageId: villageId,
//         includeTags: ["pigSpreader"],
//         villageId: villageId,
//         factionName: FACTION_NAME_OBSTACLE
//     })
    
//     SNIPPET_BuildingComplete("bc_key_nether_spreader_built", (crystalEntity, payload) => {
//         const villageId = payload.ownerVillageId
//         // This adds 1 to our village variable when a nether spreader gets built in village generation, this will equal the total num of nether spreaders
//         const netherSpreaders = DeltaVillageVariable(villageId, "remaining_key_nether_spreaders", 1)
//         if (IsStructureDestructionBase(villageId) && QUERY_GetGlobalVariable(piglinGeneralVal.globals.firstCoilCinePlayed) !== 0) {
//             if (DoOnce(obstacleVal.global.hasVisitedCoilBase + villageId)) {
//                 SetPortalInvulnerable(villageId, true)
//             }
//             const SetPortalInvulnerable = (villageId, isInvulnerable) => {
//                 const portal = GetVillagePortal(villageId)
//                 if (HasEntities(portal)) {
//                     OUTPUT_SetInvulnerable(portal, isInvulnerable)
//                     if (isInvulnerable) {
//                         OUTPUT_AddVisualState(portal, "portal_invulnerable")
//                         OUTPUT_ApplyBuff(portal, "badger:buff_portal_invulnerable")
//                         OUTPUT_AddTag(portal, TAG_DO_NOT_ATTACK)
//                     } else {
//                         OUTPUT_RemoveVisualState(portal, "portal_invulnerable")
//                         OUTPUT_RemoveBuff(portal, "badger:buff_portal_invulnerable")
//                         OUTPUT_RemoveTag(portal, TAG_DO_NOT_ATTACK)
//                     }
//                 }
//             }
//     }})
    
//     SNIPPET_NonPopCappedEntityDestroyed("ed_attack_sub_structures_destroyed", (entity, payload) => {
//         const villageId = payload.ownerVillageId
//         // Subtract from the village variable, since one of the nether spreadres has been destroyed
//         const substructures = DeltaVillageVariable(villageId, "remaining_key_nether_spreaders", -1)
//         // Let's check if we've destroyed all the nether spreaders in this village
//         if (substructures === 0) {
//             SetPortalInvulnerable(villageId, false)
//             // Let's spawn the portal guard here
//             const faction = QUERY_GetFactionNameFromVillageID(villageId)
//             SpawnAtPortal(villageId, PIGLIN_ARCHETYPE.PORTAL_GUARD, 1, faction)
//         }})
// });