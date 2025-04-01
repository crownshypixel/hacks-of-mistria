import { useEditorStore } from "src/components/save-editor/context"
import { renownLevels, RenownRank, translateRenown } from "src/renown-utils"
import { Button, Dialog, HStack, Image, NumberInput, Portal, Stack, Table, Text } from "@chakra-ui/react"
import editIcon from "src/assets/edit.png"
import goldIcon from "src/assets/tessarae.webp"
import essenceIcon from "src/assets/essence.png"
import staminaIcon from "src/assets/stamina.png"
import renownIcon from "src/assets/renown.png"
import healthIcon from "src/assets/heart.png"
import manaIcon from "src/assets/mana.png"
import { Field } from "src/components/primitives/field"
import { InputGroup } from "src/components/primitives/input-group"
import { LuInfo } from "react-icons/lu"

import goldRankIcon from "src/assets/ranks/gold.png"
import rubyRankIcon from "src/assets/ranks/ruby.png"
import copperRankIcon from "src/assets/ranks/copper.png"
import emeraldRankIcon from "src/assets/ranks/emerald.png"
import diamondRankIcon from "src/assets/ranks/diamond.png"
import mistrilRankIcon from "src/assets/ranks/mistril.png"
import sapphireRankIcon from "src/assets/ranks/sapphire.png"
import stoneRankIcon from "src/assets/ranks/stone.png"
import silverRankIcon from "src/assets/ranks/silver.png"
import woodRankIcon from "src/assets/ranks/wood.png"
import ironRankIcon from "src/assets/ranks/iron.png"

const rankIcons: { [rank in RenownRank]: string } = {
  wood: woodRankIcon,
  stone: stoneRankIcon,
  copper: copperRankIcon,
  ruby: rubyRankIcon,
  iron: ironRankIcon,
  sapphire: sapphireRankIcon,
  silver: silverRankIcon,
  emerald: emeraldRankIcon,
  gold: goldRankIcon,
  diamond: diamondRankIcon,
  mistril: mistrilRankIcon
}

type NumberInputValueChangeDetails = Parameters<NonNullable<React.ComponentProps<typeof NumberInput.Root>["onValueChange"]>>[0]

export function StatsEditing() {
  const { gold, essence, stamina, health, mana, renown, setEdits } = useEditorStore((s) => ({
    gold: s.edits.gold,
    essence: s.edits.essence,
    stamina: s.edits.stamina,
    health: s.edits.health,
    mana: s.edits.mana,
    renown: s.edits.renown,
    setEdits: s.setEdits
  }))

  const goldChangeHandler = (gold: number) => {
    setEdits((draft) => {
      draft.gold = gold
    })
  }

  const essenceChangeHandler = (essence: number) => {
    setEdits((draft) => {
      draft.essence = essence
    })
  }

  const staminaChangeHandler = (stamina: number) => {
    setEdits((draft) => {
      draft.stamina = stamina
    })
  }

  const healthChangeHandler = (health: number) => {
    setEdits((draft) => {
      draft.health = health
    })
  }

  const manaChangeHandler = (mana: number) => {
    setEdits((draft) => {
      draft.mana = mana
    })
  }

  const renownChangeHandler = (renown: number) => {
    setEdits((draft) => {
      draft.renown = renown
    })
  }

  const renownInfo = translateRenown(renown)

  return (
    <Stack gap={4}>
      <HStack>
        <Image src={editIcon} w="24px" h="24px" />
        <Text>Stats</Text>
      </HStack>
      <HStack flexWrap="wrap">
        <StatNumberInput label="Gold" value={gold} icon={goldIcon} onValueChange={goldChangeHandler} step={100} />
        <StatNumberInput label="Essence" value={essence} icon={essenceIcon} onValueChange={essenceChangeHandler} />
        <StatNumberInput label="Stamina" value={stamina} icon={staminaIcon} onValueChange={staminaChangeHandler} />
        <StatNumberInput label="Health" value={health} icon={healthIcon} onValueChange={healthChangeHandler} />
        <StatNumberInput label="Mana" value={mana} icon={manaIcon} onValueChange={manaChangeHandler} />

        <StatNumberInput
          label="Renown"
          value={renown}
          icon={renownIcon}
          onValueChange={renownChangeHandler}
          helperInfo={<RenownInfoButton />}
        >
          <Stack pos="absolute" right="40px" gap={-2.5}>
            <HStack>
              <Text userSelect="none" textStyle="xs">
                {translateRenown(renown)?.rank || "no rank"}
              </Text>
              {renownInfo?.rank && <Image draggable={false} w="18px" h="18px" src={rankIcons[renownInfo.rank]} />}
            </HStack>
            {renownInfo?.level ? (
              <Text userSelect="none" textStyle="xs" opacity="0.7">
                lvl. {renownInfo.level}
              </Text>
            ) : null}
          </Stack>
        </StatNumberInput>
      </HStack>
    </Stack>
  )
}

function StatNumberInput({
  label,
  value,
  onValueChange,
  min = 0,
  step = 1,
  icon,
  children,
  helperInfo
}: {
  label: string
  value: number
  onValueChange: (value: number) => void
  min?: number
  step?: number
  icon?: string
  children?: React.ReactNode
  helperInfo?: React.ReactNode
}) {
  const handler = ({ valueAsNumber }: NumberInputValueChangeDetails) => {
    onValueChange(isNaN(valueAsNumber) ? min : valueAsNumber)
  }

  return (
    <Field label={label} w="fit">
      <HStack>
        <NumberInput.Root w="250px" value={value.toString()} onValueChange={handler} min={min} step={step}>
          <InputGroup startElement={<Image src={icon} w="20px" h="20px" />}>
            <>
              <NumberInput.Input px="40px" autoCorrect="off" />
              <NumberInput.Control>
                <NumberInput.IncrementTrigger />
                <NumberInput.DecrementTrigger />
              </NumberInput.Control>
              {children}
            </>
          </InputGroup>
        </NumberInput.Root>
        {helperInfo}
      </HStack>
    </Field>
  )
}

function RenownInfoButton() {
  return (
    <Dialog.Root size="xs">
      <Dialog.Trigger asChild>
        <Button variant="outline" w="25px">
          <LuInfo />
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Renown Levels</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Level</Table.ColumnHeader>
                    <Table.ColumnHeader>Renown</Table.ColumnHeader>
                    <Table.ColumnHeader>Rank</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {Object.keys(renownLevels).map((lvl) => (
                    <Table.Row key={lvl}>
                      <Table.Cell>{lvl}</Table.Cell>
                      <Table.Cell>{renownLevels[lvl as keyof typeof renownLevels].cumulative}</Table.Cell>
                      <Table.Cell>
                        <HStack>
                          {renownLevels[lvl as keyof typeof renownLevels].rank}
                          {renownLevels[lvl as keyof typeof renownLevels].rank && (
                            <Image
                              draggable={false}
                              w="18px"
                              h="18px"
                              src={rankIcons[renownLevels[lvl as keyof typeof renownLevels].rank]}
                            />
                          )}
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
