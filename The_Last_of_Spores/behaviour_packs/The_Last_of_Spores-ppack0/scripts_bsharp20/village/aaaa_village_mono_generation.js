/* eslint-disable @typescript-eslint/no-unused-vars */

const _RandomIntFromIntervalVillager = (min, max) => {
    return RandomIntFromIntervalGroup(min, max, RANDOM_GROUP_VILLAGER)
}

const _DeckShuffleVillager = (deck) => {
    DECK_ShuffleGroup(deck, RANDOM_GROUP_VILLAGER)
}

const VillageDeckO = () => {
    const villageDeck = DECK_Empty()

    //CENTRAL ZONE
    const centralFountainZone = ZonesCard("addZone", 1)
    DECK_PutOnBottomOf(LayerOfZonesCard("spawnersLoZ", 7), centralFountainZone)
    DECK_MultiplyBySingle(centralFountainZone, PlacementPreferenceCard("clearResourcesInZone"))
    DECK_MultiplyBySingle(centralFountainZone, ZoneTagCard("villageDeadCenter"))
    DECK_MultiplyBySingle(centralFountainZone, ZoneTagCard("villageRing1"))
    DECK_MultiplyBySingle(centralFountainZone, PlacementPreferenceCard(PLACEMENT_CLOSE_TO_VILLAGE_START))

    DECK_PutOnBottomOf(centralFountainZone, villageDeck)

    //BUILDABLES
    const villageFountain = BuildableCard("centerFountain")
    DECK_MultiplyByMultipleRules(villageFountain, [PlacementPreferenceCard(DIRECTION_CARD.southRect), PlacementPreferenceCard("facingNorth"), ForceBuildingPlacementCard("forceBuildingPlacement"), ZoneFilterCard("villageRing1")])

    DECK_PutOnBottomOf(villageFountain, villageDeck)

    const cornerArrowTowers = BuildableCard("arrowTower", 4)
    DECK_MultiplyBySingle(cornerArrowTowers, ZoneFilterCard("villageRing1"))
    DECK_MultiplyBySingle(cornerArrowTowers, PlacementPreferenceCard(PLACEMENT_FAR_FROM_VILLAGE_START))
    DECK_MultiplyBySingle(cornerArrowTowers, ForceBuildingPlacementCard("forceBuildingPlacement"))

    DECK_PutOnBottomOf(cornerArrowTowers, villageDeck)

    const cineStage01 = BuildableCard("cine_stage_01")
    DECK_MultiplyByMultipleRules(cineStage01, [PlacementPreferenceCard(DIRECTION_CARD.northWedge), PlacementPreferenceCard("facingNorth"), ForceBuildingPlacementCard("forceBuildingPlacement"), ZoneFilterCard("villageRing1")])

    DECK_PutOnBottomOf(cineStage01, villageDeck)


    const woodGolemSpawner = BuildableCard("woodGolemSpawner")
    DECK_MultiplyByMultipleRules(woodGolemSpawner, [PlacementPreferenceCard(PLACEMENT_CLOSE_TO_VILLAGE_START), ForceBuildingPlacementCard("forceBuildingPlacement"), ZoneFilterCard("villageRing1")])

    DECK_PutOnBottomOf(woodGolemSpawner, villageDeck)

    const stoneGolemSpawner = BuildableCard("stoneGolemSpawner")
    DECK_MultiplyByMultipleRules(stoneGolemSpawner, [PlacementPreferenceCard(PLACEMENT_CLOSE_TO_VILLAGE_START), ForceBuildingPlacementCard("forceBuildingPlacement"), ZoneFilterCard("villageRing1")])

    DECK_PutOnBottomOf(stoneGolemSpawner, villageDeck)

    SetupBasicVillageClearingCards(villageDeck)

    return villageDeck
}
