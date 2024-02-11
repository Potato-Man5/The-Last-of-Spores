// Starting area
SNIPPET_VillageGenerated("mod_a_village_setup", (villageId) => {
    // Deck initialization
    const villageDeck = DECK_Empty()

    // A center zone where the player will spawn (with some padding)
    const centerZone = ZonesCard("addZone", 6)
    DECK_MultiplyByMultipleRules(centerZone, [ZoneTagCard("villageDeadCenter"), ZoneHeightChangeCard("def6Height")])
    DECK_PutOnBottomOf(centerZone, villageDeck)

    // HACK: Instead of different village layouts, use a GV to flag spawner types.
    if (QUERY_GetGlobalVariable("placed_wood_spawner") === 0) {
        const woodSpawner = BuildableCard("culture1HouseSmall")
        DECK_MultiplyByMultipleRules(woodSpawner, [ZoneFilterCard("villageDeadCenter")])
        DECK_PutOnBottomOf(woodSpawner, villageDeck)

        OUTPUT_SetGlobalVariable("placed_wood_spawner", 1)
    } else {
        const stoneSpawner = BuildableCard("culture1HouseMedium")
        DECK_MultiplyByMultipleRules(stoneSpawner, [ZoneFilterCard("villageDeadCenter")])
        DECK_PutOnBottomOf(stoneSpawner, villageDeck)
    }

    // Deck data
    DECK_PutOnTopOf(EntityClearingCard("clearPiglinInvisibleSpawners"), villageDeck)
    DECK_PutOnTopOf(EntityClearingCard("clearPiglins"), villageDeck)

    // Submit the deck to game logic for generation
    OUTPUT_SetNamedDeck(INSTANT_BUILD_DECK_NAME + villageId, villageDeck)
});

SNIPPET_InheritsFromGameMode("mod_a", () => {
    // HACK: Instead of different village layouts, use a GV to flag spawner types.
    OUTPUT_SetGlobalVariable("placed_wood_spawner", 0)

    // Hook into when the player's villages are generated
    LISTENFOR_VillageGenerated({
        snippet: "mod_a_village_setup",
        ownerVillageId: OWNER_VILLAGE_OPT_OUT,
        factionName: CULTURE_NAME_VILLAGERS
    })
});


// Piglin base generation logic
SNIPPET_VillageGenerated("mod_a_piglin_setup", (villageId) => {
    // Deck setup
    const piglinDeck = DECK_Empty()
    SetupBasicVillageClearingCards(piglinDeck)

    // A zone for where we're going to plop the portal
    const firstZone = ZonesCard("defCenterZone", 6)
    DECK_MultiplyBySingle(firstZone, ZoneHeightChangeCard("def1Height"))
    DECK_PutOnBottomOf(firstZone, piglinDeck)

    // An "initial zone" For some buildables
    for (let i = 0; i < 18; i++) {
        const padding = ZonesCard("add1Zone", 1)
        DECK_MultiplyBySingle(padding, ZoneTagCard("defBetweenWallsTag")) // Reusing these tags instead of making new ones with apt names because I'm lazy
        
        // There's a 25% chance that a the padding will be on the higher side of things
        if (QUERY_RandomNumberGroup(0, 3, "height_spin") < 1) {
            DECK_MultiplyBySingle(padding, ZoneHeightChangeCard("def1Height"))
        } else {
            DECK_MultiplyBySingle(padding, ZoneHeightChangeCard("def1Height"))
        }
        DECK_PutOnBottomOf(padding, piglinDeck)
    }

    // A "second initial zone" For some more buildables
    for (let i = 0; i < 18; i++) {
        const secondPadding = ZonesCard("add1Zone", 1)
        DECK_MultiplyBySingle(secondPadding, ZoneTagCard("defOuterWalls"))
        
        if (QUERY_RandomNumberGroup(0, 3, "height_spin") < 1) {
            DECK_MultiplyBySingle(secondPadding, ZoneHeightChangeCard("def1Height"))
        } else {
            DECK_MultiplyBySingle(secondPadding, ZoneHeightChangeCard("def1Height"))
        }
        DECK_PutOnBottomOf(secondPadding, piglinDeck)
    }

    // A "third initial zone" For some more buildables
    for (let i = 0; i < 18; i++) {
        const thirdPadding = ZonesCard("add1Zone", 1)
        DECK_MultiplyBySingle(thirdPadding, ZoneTagCard("defOuterWalls"))
        
         if (QUERY_RandomNumberGroup(0, 3, "height_spin") < 1) {
            DECK_MultiplyBySingle(thirdPadding, ZoneHeightChangeCard("def1Height"))
        } else {
            DECK_MultiplyBySingle(thirdPadding, ZoneHeightChangeCard("def1Height"))
        }
        DECK_PutOnBottomOf(thirdPadding, piglinDeck)
    }

    // The portal buildable that the player must destroy
    const portal = BuildableCard("obstaclePortalMedium")
    DECK_MultiplyBySingle(portal, ZoneHeightChangeCard("def16Height"))
    DECK_MultiplyBySingle(portal, PlacementPreferenceCard(PLACEMENT_CLOSE_TO_VILLAGE_START))
    DECK_MultiplyBySingle(portal, ForceBuildingPlacementCard("forceBuildingPlacement"))
    DECK_PutOnBottomOf(portal, piglinDeck)

    // Some "hazard" buildables placed in the initial zone
    const paddingHazards = DECK_Empty()
    DECK_PutOnBottomOf(BuildableCard("superNetherSpreaderFear", 2), paddingHazards)
    DECK_PutOnBottomOf(BuildableCard("netherSpreader", 1), paddingHazards)
    DECK_PutOnBottomOf(BuildableCard("buildingRegenerator", 1), paddingHazards)
    DECK_PutOnBottomOf(BuildableCard("piglinSporeFan", 1), paddingHazards)
    DECK_PutOnBottomOf(BuildableCard("defendRallyPoint", 1), paddingHazards)
    DECK_MultiplyByMultipleRules(paddingHazards, [AppearanceOverrideCard(BUILDING_APPEARANCE_OVERRIDE_OBSTACLE_HORDE)])
    DECK_MultiplyBySingle(paddingHazards, ZoneFilterCard("defBetweenWalls")) 
    DECK_PutOnBottomOf(paddingHazards, piglinDeck)

    // Some "hazard" buildables placed in the second initial zone
    const secondPaddingHazards = DECK_Empty()
    DECK_PutOnBottomOf(BuildableCard("superNetherSpreaderFear", 1), secondPaddingHazards)
    DECK_PutOnBottomOf(BuildableCard("netherSpreader", 2), secondPaddingHazards)
    DECK_PutOnBottomOf(BuildableCard("piglinKnockbackTower", 2), secondPaddingHazards)
    DECK_MultiplyByMultipleRules(secondPaddingHazards, [AppearanceOverrideCard(BUILDING_APPEARANCE_OVERRIDE_OBSTACLE_HORDE)])
    DECK_MultiplyBySingle(secondPaddingHazards, ZoneFilterCard("defOuterWalls"))
    DECK_PutOnBottomOf(secondPaddingHazards, piglinDeck)

    // Some "hazard" buildables placed in the third initial zone
    const thirdPaddingHazards = DECK_Empty()
    DECK_PutOnBottomOf(BuildableCard("netherSpreader", 2), thirdPaddingHazards)
    DECK_PutOnBottomOf(BuildableCard("piglinKnockbackTower", 2), thirdPaddingHazards)
    DECK_PutOnBottomOf(BuildableCard("addFighterBarracks", 2), thirdPaddingHazards)
    DECK_MultiplyByMultipleRules(thirdPaddingHazards, [AppearanceOverrideCard(BUILDING_APPEARANCE_OVERRIDE_OBSTACLE_HORDE)])
    DECK_MultiplyBySingle(thirdPaddingHazards, ZoneFilterCard("defOuterWalls"))
    DECK_PutOnBottomOf(thirdPaddingHazards, piglinDeck)
    
    // Submitting the deck microcode to the deck-interpeting virtual machine for groundbreaking deck systems engineering
    OUTPUT_SetNamedDeck(INSTANT_BUILD_DECK_NAME + villageId, piglinDeck)

});

SNIPPET_VillageGenerated ("mod_a", () => {
    LISTENFOR_BuildingComplete({
        snippet: "bc_key_nether_spreader_built",
        ownerVillageId: villageId,
        includeTags: ["pigSpreader"],
        villageId: villageId,
        factionName: FACTION_NAME_OBSTACLE
    })
    
    LISTENFOR_NonPopCappedEntityDestroyed({
        snippet: "ed_key_nether_spreader_destroyed",
        ownerVillageId: villageId,
        includeTags: ["pigSpreader"],
        villageId: villageId,
        factionName: FACTION_NAME_OBSTACLE
    });
    
    SNIPPET_BuildingComplete("bc_key_nether_spreader_built", (crystalEntity, payload) => {
        const villageId = payload.ownerVillageId
        // This adds 1 to our village variable when a nether spreader gets built in village generation, this will equal the total num of nether spreaders
        const netherSpreaders = DeltaVillageVariable(villageId, "remaining_key_nether_spreaders", 1)
        if (substructures === 1) {
        SetPortalInvulnerable(villageId, true)
    }})
    
    SNIPPET_NonPopCappedEntityDestroyed("ed_key_nether_spreader_destroyed", (entity, payload) => {
        const villageId = payload.ownerVillageId
        // Subtract from the village variable, since one of the nether spreadres has been destroyed
        const substructures = DeltaVillageVariable(villageId, "remaining_key_nether_spreaders", -1)
        // Let's check if we've destroyed all the nether spreaders in this village
        if (substructures === 0) {
            SetPortalInvulnerable(villageId, false)
            // Let's spawn the portal guard here
            const faction = QUERY_GetFactionNameFromVillageID(villageId)
            SpawnAtPortal(villageId, PIGLIN_ARCHETYPE.PORTAL_GUARD, 1, faction)
        }})
});

SNIPPET_InheritsFromGameMode("mod_a", () => {
    // Hook in our logic to when a defend faction is generated
    LISTENFOR_VillageGenerated({
        snippet: "mod_a_piglin_setup",
        ownerVillageId: OWNER_VILLAGE_OPT_OUT,
        factionName: FACTION_NAME_OBSTACLE
    })
});

// Win condition
SNIPPET_InheritsFromGameMode("mod_a", (_villageId, _payload) => {
    LISTENFOR_VillageDestroyed({
        snippet: "mod_a_piglin_base_destroyed",
        ownerVillageId: OWNER_VILLAGE_OPT_OUT,
        factionName: FACTION_NAME_OBSTACLE
    })
});

SNIPPET_VillageDestroyed("mod_a_piglin_base_destroyed", () => {
    OUTPUT_EndMatch(TEAM_BLUE)
});


// Lose condition
SNIPPET_InheritsFromGameMode("mod_a", (_villageId, _payload) => {
    LISTENFOR_NonPopCappedEntityDestroyed({
        snippet: "mod_a_player_death",
        ownerVillageId: OWNER_VILLAGE_OPT_OUT,
        includeTags: ["player"],
        despawned: false
    })

    LISTENFOR_PlayersReady({
        snippet: "mod_a_player_ready",
        ownerVillageId: OWNER_VILLAGE_OPT_OUT
    })
});

SNIPPET_PlayersReady("mod_a_player_ready", (_payload) => {
    LISTENFOR_LocalTimer({
        snippet: "mod_a_pacing_delay_intro",
        ownerVillageId: OWNER_VILLAGE_OPT_OUT,
        waitTime: 5.0
    })

    Once()
})

SNIPPET_LocalTimer("mod_a_pacing_delay_intro", (_payload) => {
    OUTPUT_SetLivesCounter(1, TEAM_BLUE, true)

    // I don't know why this isn't working correctly for me, but I'm going to cut the feature for time's sake.
    OUTPUT_Announce("mod_a_intro_message", [])

    Once()
})
