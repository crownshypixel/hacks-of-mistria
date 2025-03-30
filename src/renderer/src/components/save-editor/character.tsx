import { useEditorStore } from "src/components/save-editor/context"
import { Pronoun, PronounSchema } from "schema/player"
import { createListCollection, HStack, Image, Input, Stack, Text, VStack } from "@chakra-ui/react"
import editIcon from "src/assets/edit.png"
import { SelectInput } from "src/components/custom/select-input"
import { Field } from "src/components/primitives/field"

export function CharacterEditing() {
  const { playerName, farmName, pronoun, setEdits } = useEditorStore((s) => ({
    playerName: s.edits.playerName,
    farmName: s.edits.farmName,
    pronoun: s.edits.pronoun,
    setEdits: s.setEdits
  }))

  const nameChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEdits((draft) => {
      draft.playerName = e.target.value
    })

  const farmNameChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEdits((draft) => {
      draft.farmName = e.target.value
    })

  const pronounChangeHandler = (pronoun: Pronoun) =>
    setEdits((darft) => {
      darft.pronoun = pronoun
    })

  return (
    <Stack gap={4}>
      <HStack mb={2}>
        <Image src={editIcon} w="24px" h="24px" />
        <Text>Character</Text>
      </HStack>

      <HStack flexWrap="wrap">
        <VStack>
          <Field label="Name">
            <Input autoCorrect="off" w="250px" value={playerName} onChange={nameChangeHandler} />
          </Field>
        </VStack>

        <VStack>
          <Field label="Farm">
            <Input autoCorrect="off" w="250px" value={farmName} onChange={farmNameChangeHandler} />
          </Field>
        </VStack>

        <SelectInput
          w="250px"
          collection={pronounsCollection}
          textLabel="Pronoun"
          value={formatPronouns(pronoun, true)}
          onValueChange={pronounChangeHandler}
        />
      </HStack>
    </Stack>
  )
}

export function formatPronouns(pronouns: string, reverse = false) {
  const transformFn = reverse ? "toLowerCase" : "toUpperCase"

  if (!(pronouns.includes("/") || pronouns.includes("_"))) {
    return pronouns.charAt(0)[transformFn]() + pronouns.slice(1)
  }

  const fromSymbol = reverse ? "/" : "_"
  const toSymbol = reverse ? "_" : "/"

  return pronouns
    .split(fromSymbol)
    .map((word: string) => word.charAt(0)[transformFn]() + word.slice(1))
    .join(toSymbol)
}

export const pronounsCollection = createListCollection({
  items: Object.keys(PronounSchema.enum).map((p) => ({
    label: formatPronouns(p),
    value: formatPronouns(p, true)
  }))
})
