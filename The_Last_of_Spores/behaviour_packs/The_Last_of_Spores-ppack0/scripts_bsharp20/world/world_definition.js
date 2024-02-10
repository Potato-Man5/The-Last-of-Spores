const modAWorldGenDefinition = {
    base: null,
    modify: (filterManager) => {
        filterManager.AppendFilter(['mod_a', 'center'], 1);
        filterManager.AppendFilter(['mod_a', 'set1'], 1);
        filterManager.AppendFilter(['mod_a', 'starting_area'], 2);
        filterManager.AppendFilter(['mod_a', 'piglin'], 1);
    }
};

SNIPPET_InheritsFromGameMode('mod_a', () => {
    SetWorldGenDefinition(modAWorldGenDefinition);
});
