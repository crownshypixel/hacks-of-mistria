import { useQuery } from "@tanstack/react-query"

const { invoke } = window.api

const defaultQueryOpts = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
  staleTime: Infinity,
  retry: 2
} as const

// used for loading all saves, with minimal information like name, pronoun, date, clock etc
export function useSaves() {
  return useQuery({
    ...defaultQueryOpts,
    queryKey: ["saves"],
    queryFn: async () => {
      await invoke.unpackAll()
      return invoke.getAllSavesInfo()
    }
  })
}

// used in the save-editor to load all the editing data like the player inventory, armor inventory etc
export function useSave(saveId: string | null) {
  return useQuery({
    ...defaultQueryOpts,
    queryKey: ["save", saveId],
    queryFn: async () => {
      return invoke.getSaveInfo(saveId!)
    },
    enabled: !!saveId
  })
}

// used for loading gamedata ids (furniture, recipes, etc)
export function useGamedata() {
  return useQuery({
    ...defaultQueryOpts,
    queryKey: ["gamedata"],
    queryFn: async () => {
      const versions = await invoke.getGamedataVersions()
      const gamedata = await Promise.all(versions.map((v) => invoke.getVersionGamedata(v)))
      return gamedata.filter((data) => data !== null)
    }
  })
}
