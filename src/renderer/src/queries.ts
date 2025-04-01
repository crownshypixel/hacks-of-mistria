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
    queryKey: ["default-saves"],
    queryFn: async () => {
      await invoke.unpackDefaultSaves()
      return invoke.getDefaultSavesListInfo()
    }
  })
}

// `saveKey` can be a save id or a path, the backend will handle it
export function useSave(saveKey: string | null) {
  return useQuery({
    ...defaultQueryOpts,
    queryKey: ["editing-save", saveKey],
    queryFn: () => {
      return invoke.getSaveEditingInfo(saveKey!)
    },
    enabled: !!saveKey
  })
}

// used for loading gamedata ids (furniture, recipes, etc)
export function useGamedata() {
  return useQuery({
    ...defaultQueryOpts,
    queryKey: ["gamedata"],
    queryFn: async () => {
      const versions = await invoke.getGamedataVersions()
      const gamedata = await Promise.all(versions.map((v) => invoke.getGamedata(v)))
      return gamedata.filter((data) => data !== null)
    }
  })
}
