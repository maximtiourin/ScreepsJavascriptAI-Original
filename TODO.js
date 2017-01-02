/*
 * TODO:
 * - Implement Upgrader unit
 * - Implement dynamic growth of builder limit for foreman based on conditions such as controller level, container spare resources, and maybe other factors
 *       EX: (2 * SourceCount) + ((Get All Currently Available Energy in Containers / getCurrentBuilderModel.energyCost) - 1)
 * - Implement Cache global object that can store cached results only for the current tick, so that an expensive operation isn't performed more than once per tick.
 *       EX: run a function like GetAllCurrentlyAvailableContainerEnergyInRoom, which returns either the result (storing it in cache), or the cached result, if it exists
 */