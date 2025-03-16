import { createIpcSlice, combineIpcs } from "interprocess"
import { readJson, updateObjectValue, writeJson } from "../main/util"
import { HeaderSchema, Player, PlayerSchema, Pronoun, PronounSchema } from "../schema"
import { packSave, savesPaths, unpackAllSaves, unpackSave } from "../main/vault"
import { GamedataSchema } from "../schema/gamedata"
import { ArmorInventory, PlayerInventory, RenownInventory } from "../schema/inventory"

type BaseIpcData = { saveId: string }

type IpcData<K extends string = never, V = never> = BaseIpcData &
  (K extends never
    ? {}
    : {
        [key in K]: V
      })

const vaultSlice = createIpcSlice({
  main: {
    async pack(_, { saveId, shouldBringOnTop }: IpcData<"shouldBringOnTop", boolean>) {
      return packSave(saveId, shouldBringOnTop)
    },
    async unpack(_, { saveId }: BaseIpcData) {
      return unpackSave(saveId)
    },
    async unpackAll() {
      return unpackAllSaves()
    }
  }
})

const updateSlice = createIpcSlice({
  main: {
    async updateGold(_, { saveId, gold }: IpcData<"gold", number>) {
      const savePaths = savesPaths[saveId]

      const { header, player } = savePaths.json

      const parsedHeader = HeaderSchema.parse(await readJson(header))
      const parsedPlayer = HeaderSchema.parse(await readJson(player))

      const updatedHeader = updateObjectValue(parsedHeader, { keyPath: "stats.gold", value: gold })
      const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "stats.gold", value: gold })

      await writeJson(savePaths.json.header, HeaderSchema.parse(updatedHeader))
      await writeJson(savePaths.json.player, PlayerSchema.parse(updatedPlayer))
    },
    async updateEssence(_, { saveId, essence }: IpcData<"essence", number>) {
      const savePaths = savesPaths[saveId]

      const { header, player } = savePaths.json

      const parsedHeader = HeaderSchema.parse(await readJson(header))
      const parsedPlayer = HeaderSchema.parse(await readJson(player))

      const updatedHeader = updateObjectValue(parsedHeader, { keyPath: "stats.essence", value: essence })
      const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "stats.essence", value: essence })

      await writeJson(savePaths.json.header, HeaderSchema.parse(updatedHeader))
      await writeJson(savePaths.json.player, PlayerSchema.parse(updatedPlayer))
    },
    async updateRenown(_, { saveId, renown }: IpcData<"renown", number>) {
      const savePaths = savesPaths[saveId]

      const { header, player } = savePaths.json

      const parsedHeader = HeaderSchema.parse(await readJson(header))
      const parsedPlayer = HeaderSchema.parse(await readJson(player))

      const updatedHeader = updateObjectValue(parsedHeader, { keyPath: "stats.renown", value: renown })
      const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "stats.renown", value: renown })

      await writeJson(savePaths.json.header, HeaderSchema.parse(updatedHeader))
      await writeJson(savePaths.json.player, PlayerSchema.parse(updatedPlayer))
    },
    async updateHealth(_, { saveId, health }: IpcData<"health", number>) {
      const savePaths = savesPaths[saveId]

      const { header, player } = savePaths.json

      const parsedHeader = HeaderSchema.parse(await readJson(header))
      const parsedPlayer = PlayerSchema.parse(await readJson(player))

      const updatedHeader = updateObjectValue(parsedHeader, [
        { keyPath: "stats.base_health", value: health },
        { keyPath: "stats.health_current", value: health }
      ])
      const updatedPlayer = updateObjectValue(parsedPlayer, [
        { keyPath: "stats.base_health", value: health },
        { keyPath: "stats.health_current", value: health }
      ])

      await writeJson(savePaths.json.header, HeaderSchema.parse(updatedHeader))
      await writeJson(savePaths.json.player, PlayerSchema.parse(updatedPlayer))
    },
    async updateStamina(_, { saveId, stamina }: IpcData<"stamina", number>) {
      const savePaths = savesPaths[saveId]

      const { header, player } = savePaths.json

      const parsedHeader = HeaderSchema.parse(await readJson(header))
      const parsedPlayer = PlayerSchema.parse(await readJson(player))

      const updatedHeader = updateObjectValue(parsedHeader, [
        { keyPath: "stats.base_stamina", value: stamina },
        { keyPath: "stats.stamina_current", value: stamina }
      ])
      const updatedPlayer = updateObjectValue(parsedPlayer, [
        { keyPath: "stats.base_stamina", value: stamina },
        { keyPath: "stats.stamina_current", value: stamina }
      ])

      await writeJson(savePaths.json.header, HeaderSchema.parse(updatedHeader))
      await writeJson(savePaths.json.player, PlayerSchema.parse(updatedPlayer))
    },
    async updateMana(_, { saveId, mana }: IpcData<"mana", number>) {
      const savePaths = savesPaths[saveId]

      const { header, player } = savePaths.json

      const parsedHeader = HeaderSchema.parse(await readJson(header))
      const parsedPlayer = PlayerSchema.parse(await readJson(player))

      const updatedHeader = updateObjectValue(parsedHeader, [
        { keyPath: "stats.mana_max", value: mana },
        { keyPath: "stats.mana_current", value: mana }
      ])
      const updatedPlayer = updateObjectValue(parsedPlayer, [
        { keyPath: "stats.mana_max", value: mana },
        { keyPath: "stats.mana_current", value: mana }
      ])

      await writeJson(savePaths.json.header, HeaderSchema.parse(updatedHeader))
      await writeJson(savePaths.json.player, PlayerSchema.parse(updatedPlayer))
    },
    async updateFarmName(_, { saveId, farmName }: IpcData<"farmName", string>) {
      const savePaths = savesPaths[saveId]

      const { header, player } = savePaths.json

      const parsedHeader = HeaderSchema.parse(await readJson(header))
      const parsedPlayer = PlayerSchema.parse(await readJson(player))

      const updatedHeader = updateObjectValue(parsedHeader, { keyPath: "farm_name", value: farmName })
      const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "farm_name", value: farmName })

      await writeJson(savePaths.json.header, HeaderSchema.parse(updatedHeader))
      await writeJson(savePaths.json.player, PlayerSchema.parse(updatedPlayer))
    },
    async updatePlayerName(_, { saveId, playerName }: IpcData<"playerName", Player>) {
      const savePaths = savesPaths[saveId]

      const { header, player } = savePaths.json

      const parsedHeader = HeaderSchema.parse(await readJson(header))
      const parsedPlayer = PlayerSchema.parse(await readJson(player))

      const updatedHeader = updateObjectValue(parsedHeader, { keyPath: "name", value: playerName })
      const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "name", value: playerName })

      await writeJson(savePaths.json.header, HeaderSchema.parse(updatedHeader))
      await writeJson(savePaths.json.player, PlayerSchema.parse(updatedPlayer))
    },
    async updatePronoun(_, { saveId, pronoun }: IpcData<"pronoun", Pronoun>) {
      const savePaths = savesPaths[saveId]

      const { player } = savePaths.json

      const parsedPlayer = PlayerSchema.parse(await readJson(player))

      const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "pronoun_choice", value: PronounSchema.parse(pronoun) })

      await writeJson(savePaths.json.player, PlayerSchema.parse(updatedPlayer))
    },
    async updateCalendar(_, { saveId, calendarTime }: IpcData<"calendarTime", number>) {
      const savePaths = savesPaths[saveId]

      const { gamedata, header } = savePaths.json

      // TODO: Is gamedata update important / necessary !?
      const parsedGamedata = GamedataSchema.parse(await readJson(gamedata))
      const parsedHeader = HeaderSchema.parse(await readJson(header))

      const updatedGamedata = updateObjectValue(parsedGamedata, { keyPath: "date", value: calendarTime })
      const updatedHeader = updateObjectValue(parsedHeader, { keyPath: "calendar_time", value: calendarTime })

      await writeJson(savePaths.json.gamedata, GamedataSchema.parse(updatedGamedata))
      await writeJson(savePaths.json.header, HeaderSchema.parse(updatedHeader))
    },
    async updateBirthday(_, { saveId, birthday }: IpcData<"birthday", number>) {
      const savePaths = savesPaths[saveId]

      const { player } = savePaths.json

      const parsedPlayer = PlayerSchema.parse(await readJson(player))

      const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "birthday", value: birthday })

      await writeJson(savePaths.json.player, PlayerSchema.parse(updatedPlayer))
    },
    async updatePlayerInventory(_, { saveId, playerInventory }: IpcData<"playerInventory", PlayerInventory>) {
      const savePaths = savesPaths[saveId]

      const { player } = savePaths.json

      const parsedPlayer = PlayerSchema.parse(await readJson(player))

      const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "inventory", value: playerInventory })

      await writeJson(savePaths.json.player, PlayerSchema.parse(updatedPlayer))
    },
    async updateRenownInventory(_, { saveId, renownInventory }: IpcData<"renownInventory", RenownInventory>) {
      const savePaths = savesPaths[saveId]

      const { player } = savePaths.json

      const parsedPlayer = PlayerSchema.parse(await readJson(player))

      const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "renown_reward_inventory", value: renownInventory })

      await writeJson(savePaths.json.player, PlayerSchema.parse(updatedPlayer))
    },
    async updateArmorInventory(_, { saveId, armorInventory }: IpcData<"armorInventory", ArmorInventory>) {
      const savePaths = savesPaths[saveId]

      const { player } = savePaths.json

      const parsedPlayer = PlayerSchema.parse(await readJson(player))

      const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "armor", value: armorInventory })

      await writeJson(savePaths.json.player, PlayerSchema.parse(updatedPlayer))
    }
  }
})

export const { exposeApiToGlobalWindow, ipcMain, ipcRenderer } = combineIpcs(vaultSlice, updateSlice)
