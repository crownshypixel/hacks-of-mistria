import { useMutation } from "@tanstack/react-query"
import { type EditorData } from "./store"

export function useApplySaveChanges(saveId: string) {
  return useMutation({
    mutationFn: async ({ edits, shouldBringOnTop }: { edits: EditorData; shouldBringOnTop: boolean }) => {
      await window.api.invoke.setGold({ saveId, gold: edits.gold })
      await window.api.invoke.setEssence({ saveId, essence: edits.essence })
      await window.api.invoke.setRenown({ saveId, renown: edits.renown })
      await window.api.invoke.setHealth({ saveId, health: edits.health })
      await window.api.invoke.setStamina({ saveId, stamina: edits.stamina })
      await window.api.invoke.setMana({ saveId, mana: edits.mana })
      await window.api.invoke.setFarmName({ saveId, farmName: edits.farmName })
      await window.api.invoke.setPlayerName({ saveId, playerName: edits.playerName })
      await window.api.invoke.setPronoun({ saveId, pronoun: edits.pronoun })
      await window.api.invoke.setCalendar({ saveId, calendar: edits.calendar })
      await window.api.invoke.setBirthday({ saveId, birthday: edits.birthday })
      await window.api.invoke.setPlayerInventory({ saveId, playerInventory: edits.playerInventory })
      await window.api.invoke.packSave({ saveId, shouldBringOnTop })
    }
  })
}
