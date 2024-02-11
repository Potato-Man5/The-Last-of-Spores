// const SetPortalInvulnerable = (villageId, isInvulnerable) => {
//     const portal = GetVillagePortal(villageId)
//     if (HasEntities(portal)) {
//         OUTPUT_SetInvulnerable(portal, isInvulnerable)
//         if (isInvulnerable) {
//             OUTPUT_AddVisualState(portal, "portal_invulnerable")
//             OUTPUT_ApplyBuff(portal, "badger:buff_portal_invulnerable")
//             OUTPUT_AddTag(portal, TAG_DO_NOT_ATTACK)
//         } else {
//             OUTPUT_RemoveVisualState(portal, "portal_invulnerable")
//             OUTPUT_RemoveBuff(portal, "badger:buff_portal_invulnerable")
//             OUTPUT_RemoveTag(portal, TAG_DO_NOT_ATTACK)
//         }
//     }
// }