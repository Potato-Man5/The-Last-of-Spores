const villageGenericData = {
    cinematic: {
        fountainDisabled: "vil01_c09_fountain_disable"
    },
    VO: {
        villageCurrentlyUnderAttack: "invasion_village_under_attack_1",
        villageCurrentlyTargeted: "invasion_village_targeted_2",
        villagePostIntro: "village_post_intro", // first visit, emeralds
        villagePostVindicatorsVO: "main_village_new_allies", // post-vindicators, new allies,
        villageVindicatorsLureVO: "main_warriors_in_village",
        villageOccupied: "village_occupation",
        villageOccupationFreed: "village_post_defended",
        wellhouseCurrentlyTargeted: "wellhouse_targeted_player_enter",
        villageReminderBuildDefensesCasual: "villageattack_builddefenses_casual",
        villageReminderBuildDefensesDuringDay: "villageattack_builddefenses_during_day"
    },
    consts: {
        invasionVOProximityDistance: 200,
        vinidcatorsLureVOCooldown: 30,
        buildDefensesDuringDayReminderDelay: 30,
        buildDefensesCasualReminderDelay: 30,
        act3VindicatorCountInVillage: 18
    },
    globals: {
        villageCurrentlyUnderAttackPlayed: "villageCurrentlyUnderAttackPlayed",
        villageCurrentlyTargetedPlayed: "villageCurrentlyTargetedPlayed",
        villageOccupiedPlayed: "villageIsOccupiedPlayed",
        villagePostOccupationPlayed: "villagePostOccupationPlayed",
        wellhouseCurrentlyTargetedPlayed: "wellhouseCurrentlyTargetedPlayed",
        villageBuildDefensesCasualReminderPlayed: "villageBuildDefensesCasualReminderPlayed",
        villageBuildDefensesDuringDayPlayed: "villageBuildDefensesDuringDay"
    },
    presentation: {
        startMusic: "on_village_enter_music_start",
        stopMusic: "on_village_enter_music_stop"
    },
    // each index should correspond to CULTURE_THRESHOLDS. note the first index is if the first threshold is not reached.
    musicThresholds: ["default", "level1", "level2", "level3", "level3", "level3"],
    reward: {
        item: "emerald"
    },
    postInvasionBehaviorTime: 12,
    behaviorVolumeTag: "bahaviour_trigger_volume"
}

//Mono Village generation -- Please refer to the helper files for the full village generation details.
//=====================================================================================================================================================================

const _MonoVillageDeck = (villageId) => {
    OUTPUT_SetNamedDeck(INSTANT_BUILD_DECK_NAME + villageId, VillageDeckO())
}

//=====================================================================================================================================================================

const _InvasionResultBehavior = (villageId) => {
    const invasionResult = GetVillageVariable(villageId, INVASION_ATTACK_RESULT_VILLAGE_VARIABLE)
    Logi("invasionResult invasionResult = " + invasionResult)
    if (invasionResult === INVASION_ATTACK_RESULT.OBDESTROYED) {
        SetVillageTemporaryBehavior(villageId, VILLAGE_TEMP_BEHAVIOR_STATE.HEAVY_CHEER, villageGenericData.postInvasionBehaviorTime)
    } else if (invasionResult === INVASION_ATTACK_RESULT.UNDAMAGED) {
        SetVillageTemporaryBehavior(villageId, VILLAGE_TEMP_BEHAVIOR_STATE.CHEER, villageGenericData.postInvasionBehaviorTime)
    } else if (invasionResult === INVASION_ATTACK_RESULT.DAMAGED) {
        SetVillageTemporaryBehavior(villageId, VILLAGE_TEMP_BEHAVIOR_STATE.SCARED, villageGenericData.postInvasionBehaviorTime)
    } else if (invasionResult === INVASION_ATTACK_RESULT.DESTROYED) {
        SetVillageTemporaryBehavior(villageId, VILLAGE_TEMP_BEHAVIOR_STATE.HEAVY_SCARED, villageGenericData.postInvasionBehaviorTime)
    }

    SetVillageVariable(villageId, INVASION_ATTACK_RESULT_VILLAGE_VARIABLE, -1)
    SetVillageBehavior(villageId)
}

const _setupVillageBehaviorMode = () => {
    LISTENFOR_VillageGenerated({
        snippet: "vg_setup_village",
        ownerVillageId: OWNER_VILLAGE_OPT_OUT,
        factionName: CULTURE_NAME_VILLAGERS
    })
}

// This previously used the villageBehaviourMode game rule
SNIPPET_InheritsFromGameMode("campaign", () => {
    _setupVillageBehaviorMode()
})

SNIPPET_InheritsFromGameMode("editor", () => {
    _setupVillageBehaviorMode()
})

SNIPPET_VillageGenerated("vg_setup_village", (villageId) => {
    //Build the village's deck
    const villageEntity = GetVillageEntityFromID(villageId)
    //We no longer need to do a check here, because it is only one size now
    Logi("Mono village generated (vg_setup_village)")

    if (QUERY_GetFactionSizeFromVillageID(villageId) !== "player_outpost") {
        _MonoVillageDeck(villageId)
    }

    LISTENFOR_BuildingComplete({
        snippet: "bc_village_fountain_cs",
        ownerVillageId: villageId,
        includeTags: [TAG_VILLAGE_FOUNTAIN],
        villageId: villageId
    })

    LISTENFOR_BuildingComplete({
        snippet: "bc_village_outpost_cs",
        ownerVillageId: villageId,
        includeTags: [TAG_OUTPOST_STRUCTURE],
        villageId: villageId
    })

    LISTENFOR_EntitySpawned({
        snippet: "es_set_villager_behaviour",
        ownerVillageId: villageId,
        includeTags: ["villager"],
        villageId: villageId
    })

    LISTENFOR_EntitySpawned({
        snippet: "es_set_illager_behaviour",
        ownerVillageId: villageId,
        includeTags: ["illager"],
        villageId: villageId
    })

    LISTENFOR_LocalTimer({
        snippet: "lt_villager_and_illager_behavior_refresher",
        ownerVillageId: villageId,
        waitTime: 5
    })
    //Villager/Illager behaviour when culture score goes up
    for (const threshold of CULTURE_THRESHOLDS) {
        LISTENFOR_CultureValueChangedUp({
            snippet: "cv_behaviour_cheer",
            thresholdA: threshold,
            ownerVillageId: villageId,
            villageId: villageId
        })
    }

    SetVillageVariable(villageId, INVASION_ATTACK_RESULT_VILLAGE_VARIABLE, -1)
    const invasionResultVillageVariableKey = GetVillageVariableKey(villageId, INVASION_ATTACK_RESULT_VILLAGE_VARIABLE)
    LISTENFOR_GlobalVariableChanged({
        snippet: "gvc_invasion_result_village_variable",
        ownerVillageId: villageId,
        variableName: invasionResultVillageVariableKey,
        payloadInt: villageId
    })

    LISTENFOR_EntityEnabled({
        snippet: "ee_enable_house",
        ownerVillageId: villageId
    })

    LISTENFOR_EntityDisabled({
        snippet: "ee_disable_house",
        ownerVillageId: villageId
    })
    OUTPUT_MapSetKeyValue(villageEntity, MAP_KEY.STATE, MAP_ICON_STATE.UNHURT)
})

SNIPPET_CultureValueChangedDown("cvcd_music_set_0", (_scoreA, _scoreB, _scoreC, payload) => {
    const fountain = GetVillageFountain(payload.ownerVillageId)
    OUTPUT_SetEmitterState(fountain, "default")
})

//Villager/Illager behaviour when culture score goes up
SNIPPET_CultureValueChangedUp("cv_behaviour_cheer", (_scoreA, _scoreB, _scoreC, payload) => {
    SetVillageTemporaryBehavior(payload.ownerVillageId, VILLAGE_TEMP_BEHAVIOR_STATE.CHEER, 12)
    Logi("village cheer 01")
})

SNIPPET_BuildingComplete("bc_discover_fountain", (fountain) => {
    const villageId = QUERY_GetVillageIDFromEntity(fountain)
    const respawnPointEntity = GetEntitiesWithTagsAndVillage(["respawn_point"], villageId)
    OUTPUT_FlagEntityAsVisited(respawnPointEntity)
    Once()
})

// ==== VILLAGE FOUNTAIN BUILT ============================================================================
SNIPPET_BuildingComplete("bc_village_fountain_cs", (fountain) => {
    //get village ID for later
    const villageId = QUERY_GetVillageIDFromEntity(fountain)

    LISTENFOR_EntityDisabled({
        snippet: "ee_fountain_disabled",
        ownerVillageId: villageId,
        disabledEntity: fountain,
        villageId: villageId
    })

    LISTENFOR_CinematicFinished({
        snippet: "cf_village_fountain_destroyed",
        ownerVillageId: villageId,
        cinematicName: villageGenericData.cinematic.fountainDisabled,
        payloadInt: villageId
    })

    //spawn entry volume
    const villageBoundaryVolume = SpawnTriggerVolume(fountain, fountain, "badger:spatial_trigger_village_generic", TEAM_WILD, villageId, true, [TAG_PLAYER], [], ALLIANCE_FRIENDLY)
    LISTENFOR_SpatialPartitionEntered({
        snippet: "spe_village_first_enter",
        triggerEntity: villageBoundaryVolume,
        payloadEntities: fountain,
        ownerVillageId: villageId
    })


    //spawn village behavior trigger volume
    const villageBehaviorVolume = SpawnTriggerVolume(fountain, fountain, "badger:spatial_trigger_village_generic", TEAM_WILD, villageId, true, [TAG_PLAYER], [], ALLIANCE_FRIENDLY)
    LISTENFOR_SpatialPartitionEntered({
        snippet: "spe_village_behavior",
        triggerEntity: villageBehaviorVolume,
        ownerVillageId: villageId
    })
    OUTPUT_AddTag(villageBehaviorVolume, villageGenericData.behaviorVolumeTag)

    // SetupVillageBehavior(fountain, villageId)

    //spawn spawners
    const gamemode = QUERY_GetGameMode()
    if (gamemode === GAMEMODE_CAMPAIGN) {
        // TODO: once poi_mounts has a mono version that lists all possible mounts/spawners we can iterate through that
        const mountSpawnPosition = QUERY_GetChildEntitiesWithInstanceName(fountain, "metadata_mount_spawn_position")
        SpawnEntitiesAt(mountSpawnPosition, "badger:spawner_mount_01", 1, TEAM_BLUE, villageId)
        SpawnEntitiesAt(mountSpawnPosition, "badger:spawner_mount_03", 1, TEAM_BLUE, villageId)
        SpawnEntitiesAt(mountSpawnPosition, "badger:spawner_mount_04", 1, TEAM_BLUE, villageId)
        SpawnEntitiesAt(mountSpawnPosition, "badger:spawner_mount_05", 1, TEAM_BLUE, villageId)
    }
    if (gamemode === GAMEMODE_CAMPAIGN || gamemode === GAMEMODE_PVP) {
        // TODO: this should probably live in a campaign and pvp variant script. this file explicitly knows about another game mode otherwise.
        const vindicatorSpawnPosition = QUERY_GetChildEntitiesWithInstanceName(fountain, "metadata_vindicator_spawn_position")
        SpawnEntitiesAt(vindicatorSpawnPosition, "badger:spawner_vindicator_invisible", 1, TEAM_BLUE, villageId)
    }

    //culture state
    for (let level = 0; level < CULTURE_THRESHOLDS.length; level++) {
        LISTENFOR_CultureValueChangedUp({
            snippet: "cvcu_set",
            ownerVillageId: villageId,
            villageId: villageId,
            thresholdA: CULTURE_THRESHOLDS[level],
            payloadEntities: fountain,
            payloadInt: level + 1
        })
        LISTENFOR_CultureValueChangedDown({
            snippet: "cvcd_set",
            ownerVillageId: villageId,
            villageId: villageId,
            thresholdA: CULTURE_THRESHOLDS[level],
            payloadEntities: fountain,
            payloadInt: level
        })
    }
})

const _onVillageCultureLevelUpdate = (villageId, fountain, level) => {
    Logi(`Changing music & map level to ${level} - state: ${villageGenericData.musicThresholds[level]}`)
    OUTPUT_SetEmitterState(fountain, villageGenericData.musicThresholds[level])

    const village = GetVillageEntityFromID(villageId)
    OUTPUT_MapSetKeyValue(village, MAP_KEY.VILLAGE_CULTURE_LEVEL, level.toString())
}

SNIPPET_CultureValueChangedUp("cvcu_set", (_scoreA, _scoreB, _scoreC, payload) => {
    const villageId = payload.ownerVillageId
    const fountain = payload.entities
    const level = payload.int
    _onVillageCultureLevelUpdate(villageId, fountain, level)
})

SNIPPET_CultureValueChangedDown("cvcd_set", (_scoreA, _scoreB, _scoreC, payload) => {
    const villageId = payload.ownerVillageId
    const fountain = payload.entities
    const level = payload.int
    _onVillageCultureLevelUpdate(villageId, fountain, level)
})

SNIPPET_EntityDisabled("ee_fountain_disabled", (fountainEntity) => {
    if (!QUERY_HasTags(fountainEntity, [TAG_VILLAGE_FOUNTAIN])) {
        return
    }
    // do stuff whenever a normal village is disabled
})

SNIPPET_CinematicFinished("cf_village_fountain_destroyed", (payload) => {
    if (!IsCurrentAct(ACTS.ACT_1A)) {
        AnnounceVillageDestroyed(payload.int)
    }
})

// ==== VILLAGE OUTPOST BUILT ============================================================================
SNIPPET_BuildingComplete("bc_village_outpost_cs", (outpost) => {
    //get village ID for later
    const villageId = QUERY_GetVillageIDFromEntity(outpost)

    OUTPUT_SetFastTravelEnabled(villageId, true)

    //spawn entry volume
    const villageBoundaryVolume = SpawnTriggerVolume(outpost, outpost, "badger:spatial_trigger_village_generic", TEAM_WILD, villageId, true, [TAG_PLAYER], [], ALLIANCE_FRIENDLY)
    LISTENFOR_SpatialPartitionEntered({
        snippet: "spe_village_first_enter",
        triggerEntity: villageBoundaryVolume,
        payloadEntities: outpost,
        ownerVillageId: villageId
    })

    LISTENFOR_PlayerEnteredVillage({
        snippet: "pev_invasion_player_outpost_interaction",
        ownerVillageId: OWNER_VILLAGE_OPT_OUT,
        villageId: villageId
    })
})

SNIPPET_PlayerEnteredVillage("pev_invasion_player_outpost_interaction", (villageId, _playerCount, _payload) => {
    if (IsTargetOfDelayedInvasionAttack(villageId)) {
        OUTPUT_SetInteractionState(GetPlayerOutpostStructure(villageId), false)
    } else if (IsVillageUnderInvasionAttack(villageId)) {
        OUTPUT_SetInteractionState(GetPlayerOutpostStructure(villageId), false)
    } else {
        OUTPUT_SetInteractionState(GetPlayerOutpostStructure(villageId), true)
    }
})

SNIPPET_EntityEnabled("ee_enable_house", (house) => {
    // Enable targeting
    OUTPUT_RemoveTag(house, TAG_DO_NOT_ATTACK)
    OUTPUT_RemoveTag(house, TAG_DISABLED)
})

SNIPPET_EntityDisabled("ee_disable_house", (house) => {
    // Disable targeting
    OUTPUT_AddTag(house, TAG_DO_NOT_ATTACK)
    OUTPUT_AddTag(house, TAG_DISABLED)
})

// ==== INTRO CINEMATIC ====================================================================================
SNIPPET_SpatialPartitionEntered("spe_village_first_enter", (triggerEntity, intruderEntity, _payload) => {
    // Script per-village

    const villageId = QUERY_GetVillageIDFromEntity(triggerEntity)
    const villageEntity = GetVillageEntityFromID(villageId)

    // mark village as visited
    // Adding a visited tag can be used in scripts to filter specific visited entities
    OUTPUT_AddTag(villageEntity, TAG_VISITED_VILLAGE)

    //Make village visible in the map, in case players visits the village before act2
    if (IsCurrentAct(ACTS.ACT_1A) || IsCurrentAct(ACTS.ACT_1B)) {
        OUTPUT_MapSetKeyValue(villageEntity, MAP_KEY.VISIBILITY, MAP_VISIBILITY.REVEALED)
    }

    const respawnPointEntity = GetEntitiesWithTagsAndVillage(["respawn_point"], villageId)
    OUTPUT_FlagEntityAsVisited(respawnPointEntity) // adds a flagcomponent that can be used in C++ systems

    // enable fast-travel
    if (!QUERY_IsVillageOccupied(villageId)) {
        OUTPUT_SetFastTravelEnabled(villageId, true)
    }

    OUTPUT_DispatchPlayerEnteredVillageNotice(villageEntity, intruderEntity)

    Once()
})

const VillageHasPlayerDefenses = (villageId) => {
    const currentPlayerDefenses = FILTER_ByTagFilter(QUERY_GetEntitiesOwnedByVillage(villageId), ["buildable", "defense-target"], [])
    return HasEntities(currentPlayerDefenses)
}

//==== VILLAGE BEHAVIOUR ====================================================================================
SNIPPET_SpatialPartitionEntered("spe_village_behavior", (triggerEntity, _intruderEntity, _payload) => {
    const villageId = QUERY_GetVillageIDFromEntity(triggerEntity)

    _InvasionResultBehavior(villageId)

    //Audio
    if (QUERY_IsVillageOccupied(villageId)) {
        // Occupation VO and music is handled in 'invasion_attacks_v2_occupation.js'
    } else if (IsVillageUnderInvasionAttack(villageId)) {
        //Do sth here if you like
    } else if (IsTargetOfDelayedInvasionAttack(villageId)) {
        SetVillageAudioDefault(villageId, "incoming_attack")
    } else {
        SetVillageAudioDefault(villageId)
    }
})

SNIPPET_GlobalVariableChanged("gvc_invasion_result_village_variable", (_oldValue, newValue, payload) => {
    if (newValue === -1) {
        return
    }
    const villageId = payload.int
    const villageBehaviorTriggerVolume = FILTER_ByVillageID(QUERY_GetEntitiesWithTags([villageGenericData.behaviorVolumeTag]), villageId)
    if (HasEntities(villageBehaviorTriggerVolume)) {
        const playersInsideBehaviorVolume = QUERY_GetIntruders(villageBehaviorTriggerVolume)
        if (HasEntities(playersInsideBehaviorVolume)) {
            _InvasionResultBehavior(villageId)
        }
    }
})

SNIPPET_EntitySpawned("es_set_villager_behaviour", (villager, payload) => {
    const villageId = payload.ownerVillageId
    SetVillageBehavior(villageId)
})

SNIPPET_EntitySpawned("es_set_illager_behaviour", (illager, payload) => {
    const villageId = payload.ownerVillageId
    SetVillageBehavior(villageId)
})

SNIPPET_LocalTimer("lt_villager_and_illager_behavior_refresher", (payload) => {
    const villageId = payload.ownerVillageId
    SetVillageBehavior(villageId)
    LISTENFOR_LocalTimer({
        snippet: "lt_villager_and_illager_behavior_refresher",
        ownerVillageId: villageId,
        waitTime: 5
    })
})