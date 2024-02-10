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
    DECK_MultiplyBySingle(paddingHazards, ZoneFilterCard("defBetweenWalls")) 
    DECK_PutOnBottomOf(paddingHazards, piglinDeck)

    // Some "hazard" buildables placed in the second initial zone
    const secondPaddingHazards = DECK_Empty()
    DECK_PutOnBottomOf(BuildableCard("superNetherSpreaderFear", 2), secondPaddingHazards)
    DECK_PutOnBottomOf(BuildableCard("netherSpreader", 2), secondPaddingHazards)
    DECK_PutOnBottomOf(BuildableCard("piglinKnockbackTower", 2), secondPaddingHazards)
    DECK_PutOnBottomOf(BuildableCard("addFighterBarracks", 2), secondPaddingHazards)
    DECK_MultiplyBySingle(secondPaddingHazards, ZoneFilterCard("defOuterWalls"))
    DECK_PutOnBottomOf(secondPaddingHazards, piglinDeck)
    
    // Submitting the deck microcode to the deck-interpeting virtual machine for groundbreaking deck systems engineering
    OUTPUT_SetNamedDeck(INSTANT_BUILD_DECK_NAME + villageId, piglinDeck)
});

SNIPPET_InheritsFromGameMode("mod_a", () => {
    // Hook in our logic to when a defend faction is generated
    LISTENFOR_VillageGenerated({
        snippet: "mod_a_piglin_setup",
        ownerVillageId: OWNER_VILLAGE_OPT_OUT,
        factionName: FACTION_NAME_DEFEND
    })
});

// Win condition
SNIPPET_InheritsFromGameMode("mod_a", (_villageId, _payload) => {
    LISTENFOR_VillageDestroyed({
        snippet: "mod_a_piglin_base_destroyed",
        ownerVillageId: OWNER_VILLAGE_OPT_OUT,
        factionName: FACTION_NAME_DEFEND
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

SNIPPET_NonPopCappedEntityDestroyed("mod_a_player_death", (_player) => {
    OUTPUT_SetLivesCounter(0, TEAM_BLUE, true)

    OUTPUT_EndMatch(TEAM_ORANGE)
});