import { Pronoun } from "schema/player"
import { ArmorInventory, PlayerInventory, RenownInventory } from "schema/inventory"
import { update } from "main/vault"

export const Updater = {
  gold: function (saveId: string, value: number) {
    return update(saveId, [
      { json: "header", keyPath: "stats.gold", value },
      { json: "player", keyPath: "stats.gold", value }
    ])
  },
  essence: function (saveId: string, value: number) {
    return update(saveId, [
      { json: "header", keyPath: "stats.essence", value },
      { json: "player", keyPath: "stats.essence", value }
    ])
  },
  renown: function (saveId: string, value: number) {
    return update(saveId, [
      { json: "header", keyPath: "stats.renown", value },
      { json: "player", keyPath: "stats.renown", value }
    ])
  },
  health: function (saveId: string, value: number) {
    return update(saveId, [
      { json: "header", keyPath: "stats.base_health", value },
      { json: "header", keyPath: "stats.health_current", value },
      { json: "player", keyPath: "stats.base_health", value },
      { json: "player", keyPath: "stats.health_current", value }
    ])
  },
  stamina: function (saveId: string, value: number) {
    return update(saveId, [
      { json: "header", keyPath: "stats.base_stamina", value },
      { json: "header", keyPath: "stats.stamina_current", value },
      { json: "player", keyPath: "stats.base_stamina", value },
      { json: "player", keyPath: "stats.stamina_current", value }
    ])
  },
  mana: function (saveId: string, value: number) {
    return update(saveId, [
      { json: "header", keyPath: "stats.mana_max", value },
      { json: "header", keyPath: "stats.mana_current", value },
      { json: "player", keyPath: "stats.mana_max", value },
      { json: "player", keyPath: "stats.mana_current", value }
    ])
  },
  farmName: function (saveId: string, value: string) {
    return update(saveId, [
      { json: "header", keyPath: "farm_name", value },
      { json: "player", keyPath: "farm_name", value }
    ])
  },
  playerName: function (saveId: string, value: string) {
    return update(saveId, [
      { json: "header", keyPath: "name", value },
      { json: "player", keyPath: "name", value }
    ])
  },
  pronoun: function (saveId: string, value: Pronoun) {
    return update(saveId, [{ json: "player", keyPath: "pronoun_choice", value }])
  },
  calendar: function (saveId: string, value: number) {
    return update(saveId, [
      { json: "header", keyPath: "calendar_time", value },
      { json: "gamedata", keyPath: "date", value }
    ])
  },
  birthday: function (saveId: string, value: number) {
    return update(saveId, [{ json: "player", keyPath: "birthday", value }])
  },
  playerInventory: function (saveId: string, value: PlayerInventory) {
    return update(saveId, [{ json: "player", keyPath: "inventory", value }])
  },
  renownInventory: function (saveId: string, value: RenownInventory) {
    return update(saveId, [{ json: "player", keyPath: "renown_reward_inventory", value }])
  },
  armorInventory: function (saveId: string, value: ArmorInventory) {
    return update(saveId, [{ json: "player", keyPath: "armor", value }])
  }
}

export type UpdateType = keyof typeof Updater
