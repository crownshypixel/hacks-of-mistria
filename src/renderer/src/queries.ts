import { useQuery, useSuspenseQuery } from "@tanstack/react-query"

const { invoke } = window.api

const defaultQueryOpts = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
  staleTime: Infinity,
  retry: 2
} as const

export const useGameSavesInfoKey = ["gamesaves"] as const
export function useGameSavesInfo() {
  return useQuery({
    ...defaultQueryOpts,
    queryKey: useGameSavesInfoKey,
    queryFn: async () => {
      await invoke.unpackAll()
      return invoke.getAllSavesInfo()
    }
  })
}

export function useGameSaveInfo(saveId: string | null) {
  return useQuery({
    ...defaultQueryOpts,
    queryKey: ["save-info", saveId],
    queryFn: () => invoke.getSaveInfo(saveId!),
    enabled: !!saveId
  })
}

export function useUnpackAllSaves() {
  return useQuery({
    ...defaultQueryOpts,
    queryKey: ["save-ids"],
    queryFn: () => invoke.unpackAll()
  })
}

export function useAllSavesInfo() {
  return useQuery({
    ...defaultQueryOpts,
    queryKey: ["saves-info"],
    queryFn: () => invoke.getAllSavesInfo()
  })
}

export function useSaveEditingInfo(saveId: string) {
  return useQuery({
    ...defaultQueryOpts,
    queryKey: ["save-info", saveId],
    queryFn: () => invoke.getSaveInfo(saveId)
  })
}

export async function fetchAllVersionGamedata() {
  const versions = await invoke.getGamedataVersions()
  const gamedata = await Promise.all(versions.map((v) => invoke.getVersionGamedata(v)))
  return gamedata.filter((data) => data !== null)
}

// TODO: There is a Version z schema on the main/vault. Maybe move some stuff to a shared to the renderer
export type Version = `v${number}.${number}`

export const useGamedataInfoKey = ["gamedata"]
export function useGamedataInfo() {
  return useQuery({
    ...defaultQueryOpts,
    queryKey: useGamedataInfoKey,
    queryFn: async () => {
      const versions = await invoke.getGamedataVersions()
      const gamedata = await Promise.all(versions.map((v) => invoke.getVersionGamedata(v)))
      return gamedata.filter((data) => data !== null)
    }
  })
}
