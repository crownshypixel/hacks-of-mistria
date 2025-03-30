import {
  Button,
  Card,
  Center,
  Code,
  createListCollection,
  Dialog,
  Flex,
  HStack,
  IconButton,
  Image,
  Input,
  NumberInput,
  Portal,
  Select,
  SimpleGrid,
  Stack,
  Text
} from "@chakra-ui/react"
import { useRef, useState } from "react"
import editIcon from "src/assets/edit.png"
import { useEditorStore } from "src/components/save-editor/context"
import { EditorData } from "src/store"
import { Tooltip } from "src/components/primitives/tooltip"
import { useGamedata } from "src/queries"
import { LoadingMessage } from "src/components/custom/loading"
import { RadioCardItem, RadioCardRoot } from "src/components/primitives/radio-card"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot
} from "src/components/primitives/pagination"
import FuzzySearch from "fuzzy-search"
import trashIcon from "src/assets/trash.png"
import goldIcon from "src/assets/tessarae.webp"
import { Field } from "src/components/primitives/field"
import { InputGroup } from "src/components/primitives/input-group"
import { infusionsCollection, InfusionWithNone } from "src/util"
import { SelectInput } from "src/components/custom/select-input"
import { z } from "zod"
import { AlertNotes } from "src/components/custom/alert-notes"

type VersionedGamedata = NonNullable<Awaited<ReturnType<typeof window.api.invoke.getVersionGamedata>>>
type NumberInputValueChangeDetails = Parameters<NonNullable<React.ComponentProps<typeof NumberInput.Root>["onValueChange"]>>[0]
type Gamedata = Omit<VersionedGamedata, "version">
type Version = VersionedGamedata["version"]
type Slot = EditorData["playerInventory"][number]
type Member = Slot["members"][number]
enum SlotType {
  Cosmetic = "Cosmetic",
  Cooking = "Cooking",
  Furniture = "Furniture",
  Item = "Item",
  Purse = "Purse",
  AnimalCosmetic = "AnimalCosmetic",
  Empty = "Empty"
}

function clamp(min: number, num: number, max: number) {
  return Math.min(Math.max(num, min), max)
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Stack gap={6}>
      <HStack>
        <Image src={editIcon} w="24px" h="24px" />
        <Text>Inventory</Text>
      </HStack>
      {children}
    </Stack>
  )
}

// Entry
export function InventoryEditing() {
  const { data, isPending, isError, error } = useGamedata()

  if (isPending) {
    return (
      <Layout>
        <LoadingMessage message="Loading gamedata (items, cosmetics, furniture, cooking)" />
      </Layout>
    )
  }

  if (isError) {
    return <Center my={8}>Error trying to load the gamedata: {error.message}</Center>
  }

  return (
    <Layout>
      <PlayerInventory versionedGamedata={data} />
    </Layout>
  )
}

function PlayerInventory({ versionedGamedata }: { versionedGamedata: VersionedGamedata[] }) {
  const totalSlots = useEditorStore((s) => s.edits.playerInventory.length)
  const [activeVersion, setActiveVersion] = useState<Version>(versionedGamedata.at(-1)!.version)

  const availableVersions = versionedGamedata.map((vGamedata) => vGamedata.version) // ['v0.12', 'v0.13', etc]

  const activeVersionChangeHandler = (version: Version) => setActiveVersion(version)

  // get the active version gamedata and also remove the version
  const { version: _, ...activeVersionGamedata } = versionedGamedata.find((data) => data.version === activeVersion)!

  const alertNotes = [
    "You can add any item except animal cosmetics.",
    "Depending on the item id you choose, more options will open for you to fill.",
    "Some items might show the quantity option even if they don't (or shouldn't) stack, like equipment items. Be mindful where you add quantity.",
    "Generally you can put any infusion on any item. It doesn't seem to cause any issues but you never know. If you are not sure, the wiki might help: https://fieldsofmistria.wiki.gg/wiki/Infusion"
  ]

  return (
    <Stack gap={4}>
      <AlertNotes notes={alertNotes} />

      <SimpleGrid columns={5} gap={5} w="full">
        {Array(totalSlots)
          .fill(0)
          .map((_, id) => (
            <Card.Root key={id} textStyle="md" p={4} w="full" maxW="300px">
              <Card.Body p={0}>
                <Slot slotId={id} gamedata={activeVersionGamedata} />
              </Card.Body>
            </Card.Root>
          ))}
      </SimpleGrid>

      <VersionPicker activeVersion={activeVersion} onVersionChange={activeVersionChangeHandler} versions={availableVersions} />
    </Stack>
  )
}

function Slot({ slotId, gamedata }: { slotId: number; gamedata: Gamedata }) {
  const { setEdits, slot } = useEditorStore((s) => ({ setEdits: s.setEdits, slot: s.edits.playerInventory[slotId] }))
  const slotType = getSlotType(slot)

  const ids = gamedata.items.filter((item) => item !== "animal_cosmetic")
  const cookingIds = gamedata.cookingRecipes
  const furnitureIds = gamedata.furnitureRecipes
  const cosmeticIds = gamedata.cosmetics

  const clearSlot = () => {
    setEdits((draft) => {
      draft.playerInventory[slotId].members = []
    })
  }

  return (
    <Stack gap={3}>
      <HStack justifyContent="space-between">
        <Text textOverflow="clip">Slot {slotId + 1} </Text>
        <Tooltip
          showArrow
          content="Clear slot"
          openDelay={250}
          closeDelay={50}
          contentProps={{ css: { "--tooltip-bg": "var(--chakra-colors-black-alpha-950)", "color": "white" } }}
        >
          <IconButton onClick={clearSlot} size="xs" variant="outline">
            <Image src={trashIcon} w="24px" h="24px" />
          </IconButton>
        </Tooltip>
      </HStack>

      <Stack gap={3} textStyle="sm">
        {slotType === SlotType.Cooking ? (
          <Stack my={1}>
            <Text>Item id</Text>
            <ItemIdPicker key={crypto.randomUUID()} slotId={slotId} ids={ids} />
            <Text>Recipe</Text>
            <CookingInnerItemPicker slotId={slotId} innerItemIds={cookingIds} />
          </Stack>
        ) : slotType === SlotType.Furniture ? (
          <Stack my={1}>
            <Text>Item id</Text>
            <ItemIdPicker key={crypto.randomUUID()} slotId={slotId} ids={ids} />
            <Text>Furniture</Text>
            <FurnitureInnerItemPicker slotId={slotId} innerItemIds={furnitureIds} />
          </Stack>
        ) : slotType === SlotType.Item ? (
          <Stack my={1}>
            <Text>Item id</Text>
            <ItemIdPicker key={crypto.randomUUID()} slotId={slotId} ids={ids} />
            <QuantityItemPicker slotId={slotId} />
            <InfusionPicker slotId={slotId} />
          </Stack>
        ) : slotType === SlotType.AnimalCosmetic ? (
          <Stack my={1}>
            <Text>Item id</Text>
            <ItemIdPicker key={crypto.randomUUID()} slotId={slotId} ids={ids} />
          </Stack>
        ) : slotType === SlotType.Empty ? (
          <Stack my={1}>
            <Text>Item id</Text>
            <ItemIdPicker key={crypto.randomUUID()} slotId={slotId} ids={ids} />
          </Stack>
        ) : slotType === SlotType.Purse ? (
          <Stack my={1}>
            <Text>Item id</Text>
            <ItemIdPicker key={crypto.randomUUID()} slotId={slotId} ids={ids} />
            <GoldPicker slotId={slotId} />
          </Stack>
        ) : slotType === SlotType.Cosmetic ? (
          <Stack my={1}>
            <Text>Item id</Text>
            <ItemIdPicker key={crypto.randomUUID()} slotId={slotId} ids={ids} />
            <Text>Cosmetic</Text>
            <CosmeticIdPicker slotId={slotId} cosmeticIds={cosmeticIds} />
          </Stack>
        ) : null}
      </Stack>
    </Stack>
  )
}

function InfusionPicker({ slotId }: { slotId: number }) {
  const slot = useEditorStore((s) => s.edits.playerInventory[slotId])
  const setEdits = useEditorStore((s) => s.setEdits)

  const [infusion, setInfusion] = useState(slot.members[0].infusion || InfusionWithNone.Values.none)

  const handleInfusionChange = (infValue: z.infer<typeof InfusionWithNone>) => {
    setInfusion(infValue)
    setEdits((draft) => {
      draft.playerInventory[slotId].members.forEach((member) => {
        member.infusion = infValue === InfusionWithNone.Values.none ? null : infValue
      })
    })
  }

  return (
    <SelectInput
      w="full"
      collection={infusionsCollection}
      textLabel="Infusion"
      value={infusion}
      onValueChange={handleInfusionChange}
    />
  )
}

function CosmeticIdPicker({ slotId, cosmeticIds }: { slotId: number; cosmeticIds: string[] }) {
  const pageLimit = 40
  const { slot, setEdits } = useEditorStore((s) => ({ slot: s.edits.playerInventory[slotId], setEdits: s.setEdits }))
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const searcher = useRef(new FuzzySearch(cosmeticIds))
  const scrollingAreaRef = useRef<HTMLDivElement>(null)

  const [tempCosmeticIdSelected, setTempCosmeticIdSelected] = useState(slot.members[0].cosmetic || "")

  const handlePageChange = (e: { page: number }) => {
    setPage(e.page)
    scrollingAreaRef.current?.scrollTo(0, 0)
  }

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleDialogExit = () => {
    setTempCosmeticIdSelected(slot.members[0].cosmetic || "") // this is important for when the dialog closes without clicking "Save" (e.g clicking outside)
    setSearchQuery("")
  }
  const handleSelectedCosmeticIdChange = (e: { value: string }) => {
    setTempCosmeticIdSelected(e.value)
  }

  const handleSave = () => {
    setEdits((draft) => {
      draft.playerInventory[slotId].members[0].cosmetic = tempCosmeticIdSelected
    })
  }

  const filteredCosmeticIds = searcher.current.search(searchQuery.replaceAll(" ", "_").toLowerCase()) as string[]
  const displayedCosmeticIds = filteredCosmeticIds.slice((page - 1) * pageLimit, page * pageLimit)

  const isEmpty = tempCosmeticIdSelected === ""
  return (
    <Dialog.Root size="xl" placement="top" onExitComplete={handleDialogExit}>
      <Dialog.Trigger asChild>
        <Button
          variant="outline"
          overflow="hidden"
          justifyContent="flex-start"
          textOverflow="ellipsis"
          borderWidth={isEmpty ? "4" : "2"}
          borderColor={isEmpty ? "red.400" : "gray.800"}
        >
          {isEmpty ? "Empty*" : tempCosmeticIdSelected}
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content mt="10" h="720px" textStyle="lg">
            <Dialog.Header>
              <HStack justifyContent="space-between">
                <HStack>
                  <Image src={editIcon} w="24px" h="24px" />
                  <Text>Cosmetic Picker</Text>
                </HStack>
                <HStack>
                  <Text textStyle="md">
                    Selected cosmetic: {tempCosmeticIdSelected ? <Code textStyle="xl">{tempCosmeticIdSelected}</Code> : "None"}
                  </Text>
                  <Dialog.ActionTrigger asChild>
                    <Button
                      disabled={!tempCosmeticIdSelected}
                      onClick={handleSave}
                      bg="green.600"
                      _hover={{ opacity: 0.9 }}
                      h="9"
                    >
                      Save
                    </Button>
                  </Dialog.ActionTrigger>
                </HStack>
              </HStack>
            </Dialog.Header>
            <Dialog.Body position="relative">
              <Stack gap={4}>
                <Input
                  autoFocus
                  value={searchQuery}
                  autoCorrect="off"
                  onChange={handleSearchQueryChange}
                  placeholder="Search for a cosmetic... (tip: 'eyes_droopy', 'eyes droopy' and 'EyEs DROOpy' are equal)"
                />
                <RadioCardRoot
                  ref={scrollingAreaRef as React.RefObject<HTMLDivElement>}
                  h="450px"
                  overflowY="auto"
                  value={tempCosmeticIdSelected}
                  onValueChange={handleSelectedCosmeticIdChange}
                >
                  <Flex wrap="wrap" gap={2}>
                    {displayedCosmeticIds.map((id) => (
                      <RadioCardItem
                        key={id}
                        w="fit"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        h="2em"
                        label={id}
                        value={id}
                        indicator={false}
                        _checked={{
                          "borderColor": "orange.900",
                          "--shadow-color": "colors.orange.900",
                          "backgroundColor": "orange.700"
                        }}
                        cursor="pointer"
                      />
                    ))}
                  </Flex>
                </RadioCardRoot>
              </Stack>
              <PaginationRoot
                position="absolute"
                bottom={4}
                w="full"
                variant="solid"
                count={filteredCosmeticIds.length}
                pageSize={pageLimit}
                defaultPage={1}
                py={3}
                onPageChange={handlePageChange}
                page={page}
                display="flex"
                justifyContent="center"
                gap={2}
              >
                <PaginationPrevTrigger />
                <PaginationItems />
                <PaginationNextTrigger />
              </PaginationRoot>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

function GoldPicker({ slotId }: { slotId: number }) {
  const { slot, setEdits } = useEditorStore((s) => ({ slot: s.edits.playerInventory[slotId], setEdits: s.setEdits }))
  const gold = slot.members[0].gold_to_gain || 0

  const handleGoldChange = (e: NumberInputValueChangeDetails) => {
    const safeGold = isNaN(e.valueAsNumber) ? 1 : e.valueAsNumber
    setEdits((draft) => {
      draft.playerInventory[slotId].members[0].gold_to_gain = safeGold
    })
  }

  return (
    <Field label="Gold" w="fit">
      <NumberInput.Root w="full" value={gold.toString()} onValueChange={handleGoldChange} min={0} step={100}>
        <InputGroup startElement={<Image src={goldIcon} w="20px" h="20px" />}>
          <>
            <NumberInput.Input px="40px" />
            <NumberInput.Control>
              <NumberInput.IncrementTrigger />
              <NumberInput.DecrementTrigger />
            </NumberInput.Control>
          </>
        </InputGroup>
      </NumberInput.Root>
    </Field>
  )
}

function QuantityItemPicker({ slotId }: { slotId: number }) {
  const { slot, setEdits } = useEditorStore((s) => ({ slot: s.edits.playerInventory[slotId], setEdits: s.setEdits }))
  const quantity = slot.members.length

  const handleQuantityChange = (e: NumberInputValueChangeDetails) => {
    const safeQuantity = clamp(1, isNaN(e.valueAsNumber) ? 1 : e.valueAsNumber, 999)

    const member = { ...slot.members[0] }
    setEdits((draft) => {
      // minimize the amount of array creations and state copies
      const currentMembers = draft.playerInventory[slotId].members
      if (currentMembers.length === safeQuantity) return

      if (currentMembers.length < safeQuantity) {
        // currentMembers contains less entries than what we want
        const additionalMembers = Array(safeQuantity - currentMembers.length).fill({ ...member })
        currentMembers.push(...additionalMembers)
      } else {
        currentMembers.length = safeQuantity
      }

      draft.playerInventory[slotId].members = Array(safeQuantity).fill({ ...member })
    })
  }

  return (
    <Field label="Quantity" w="full">
      <NumberInput.Root w="full" value={quantity.toString()} onValueChange={handleQuantityChange} min={1} max={999} step={1}>
        <NumberInput.Input />
        <NumberInput.Control>
          <NumberInput.IncrementTrigger />
          <NumberInput.DecrementTrigger />
        </NumberInput.Control>
      </NumberInput.Root>
    </Field>
  )
}

function FurnitureInnerItemPicker({ slotId, innerItemIds }: { slotId: number; innerItemIds: string[] }) {
  const { slot, setEdits } = useEditorStore((s) => ({ slot: s.edits.playerInventory[slotId], setEdits: s.setEdits }))
  const [searchQuery, setSearchQuery] = useState("")
  const searcher = useRef(new FuzzySearch(innerItemIds))
  const scrollingAreaRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(1)
  const pageLimit = 40

  const [tempInnerItemSelected, setTempInnerItemSelected] = useState(slot.members[0].inner_item || "")

  const handlePageChange = (e: { page: number }) => {
    setPage(e.page)
    scrollingAreaRef.current?.scrollTo(0, 0)
  }

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleDialogExit = () => {
    setTempInnerItemSelected(slot.members[0].inner_item || "") // this is important for when the dialog closes without clicking "Save" (e.g clicking outside)
    setSearchQuery("")
  }

  const handleSelectedInnerItemChange = (e: { value: string }) => {
    setTempInnerItemSelected(e.value)
  }

  const handleSave = () => {
    setEdits((draft) => {
      draft.playerInventory[slotId].members.forEach((member) => {
        member.inner_item = tempInnerItemSelected
      })
    })
  }

  const filteredInnerItemIds = searcher.current.search(searchQuery.replaceAll(" ", "_").toLowerCase()) as string[]
  const displayedInnerItemIds = filteredInnerItemIds.slice((page - 1) * pageLimit, page * pageLimit)

  const isEmpty = tempInnerItemSelected === ""

  return (
    <Dialog.Root size="xl" placement="top" onExitComplete={handleDialogExit}>
      <Dialog.Trigger asChild>
        <Button
          variant="outline"
          overflow="hidden"
          justifyContent="flex-start"
          textOverflow="ellipsis"
          borderWidth={isEmpty ? "4" : "2"}
          borderColor={isEmpty ? "red.400" : "gray.800"}
        >
          {isEmpty ? "Empty*" : tempInnerItemSelected}
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content mt="10" h="720px" textStyle="lg">
            <Dialog.Header>
              <HStack justifyContent="space-between">
                <HStack>
                  <Image src={editIcon} w="24px" h="24px" />
                  <Text>Furniture Picker</Text>
                </HStack>
                <HStack>
                  <Text textStyle="md">
                    Selected furniture: {tempInnerItemSelected ? <Code textStyle="xl">{tempInnerItemSelected}</Code> : "None"}
                  </Text>
                  <Dialog.ActionTrigger asChild>
                    <Button disabled={!tempInnerItemSelected} onClick={handleSave} bg="green.600" _hover={{ opacity: 0.9 }} h="9">
                      Save
                    </Button>
                  </Dialog.ActionTrigger>
                </HStack>
              </HStack>
            </Dialog.Header>
            <Dialog.Body position="relative">
              <Stack gap={4}>
                <Input
                  autoFocus
                  value={searchQuery}
                  autoCorrect="off"
                  onChange={handleSearchQueryChange}
                  placeholder="Search for a furniture... (tip: 'pumpkin_pie', 'pumpkin pie' and ' pumPkiN PIE' are equal)"
                />
                <RadioCardRoot
                  ref={scrollingAreaRef as React.RefObject<HTMLDivElement>}
                  h="450px"
                  overflowY="auto"
                  value={tempInnerItemSelected}
                  onValueChange={handleSelectedInnerItemChange}
                >
                  <Flex wrap="wrap" gap={2}>
                    {displayedInnerItemIds.map((id) => (
                      <RadioCardItem
                        key={id}
                        w="fit"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        h="2em"
                        label={id}
                        value={id}
                        indicator={false}
                        _checked={{
                          "borderColor": "orange.900",
                          "--shadow-color": "colors.orange.900",
                          "backgroundColor": "orange.700"
                        }}
                        cursor="pointer"
                      />
                    ))}
                  </Flex>
                </RadioCardRoot>
              </Stack>
              <PaginationRoot
                position="absolute"
                bottom={4}
                w="full"
                variant="solid"
                count={filteredInnerItemIds.length}
                pageSize={pageLimit}
                defaultPage={1}
                py={3}
                onPageChange={handlePageChange}
                page={page}
                display="flex"
                justifyContent="center"
                gap={2}
              >
                <PaginationPrevTrigger />
                <PaginationItems />
                <PaginationNextTrigger />
              </PaginationRoot>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

function CookingInnerItemPicker({ slotId, innerItemIds }: { slotId: number; innerItemIds: string[] }) {
  const { slot, setEdits } = useEditorStore((s) => ({ slot: s.edits.playerInventory[slotId], setEdits: s.setEdits }))
  const [searchQuery, setSearchQuery] = useState("")
  const searcher = useRef(new FuzzySearch(innerItemIds))
  const scrollingAreaRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(1)
  const pageLimit = 40

  const [tempInnerItemSelected, setTempInnerItemSelected] = useState(slot.members[0].inner_item || "")

  const handlePageChange = (e: { page: number }) => {
    setPage(e.page)
    scrollingAreaRef.current?.scrollTo(0, 0)
  }

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleDialogExit = () => {
    setTempInnerItemSelected(slot.members[0].inner_item || "") // this is important for when the dialog closes without clicking "Save" (e.g clicking outside)
    setSearchQuery("")
  }

  const handleSelectedInnerItemChange = (e: { value: string }) => {
    setTempInnerItemSelected(e.value)
  }

  const handleSave = () => {
    setEdits((draft) => {
      draft.playerInventory[slotId].members.forEach((member) => {
        member.inner_item = tempInnerItemSelected
      })
    })
  }

  const filteredInnerItemIds = searcher.current.search(searchQuery.replaceAll(" ", "_").toLowerCase()) as string[]
  const displayedInnerItemIds = filteredInnerItemIds.slice((page - 1) * pageLimit, page * pageLimit)

  const isEmpty = tempInnerItemSelected === ""
  return (
    <Dialog.Root size="xl" placement="top" onExitComplete={handleDialogExit}>
      <Dialog.Trigger asChild>
        <Button
          variant="outline"
          overflow="hidden"
          justifyContent="flex-start"
          textOverflow="ellipsis"
          borderColor={isEmpty ? "red.400" : "gray.800"}
        >
          {isEmpty ? "Empty*" : tempInnerItemSelected}
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content mt="10" h="720px" textStyle="lg">
            <Dialog.Header>
              <HStack justifyContent="space-between">
                <HStack>
                  <Image src={editIcon} w="24px" h="24px" />
                  <Text>Recipe Picker</Text>
                </HStack>
                <HStack>
                  <Text textStyle="md">
                    Selected recipe: {tempInnerItemSelected ? <Code textStyle="xl">{tempInnerItemSelected}</Code> : "None"}
                  </Text>
                  <Dialog.ActionTrigger asChild>
                    <Button disabled={!tempInnerItemSelected} onClick={handleSave} bg="green.600" _hover={{ opacity: 0.9 }} h="9">
                      Save
                    </Button>
                  </Dialog.ActionTrigger>
                </HStack>
              </HStack>
            </Dialog.Header>
            <Dialog.Body position="relative">
              <Stack gap={4}>
                <Input
                  autoFocus
                  value={searchQuery}
                  autoCorrect="off"
                  onChange={handleSearchQueryChange}
                  placeholder="Search for a recipe... (tip: 'pumpkin_pie', 'pumpkin pie' and ' pumPkiN PIE' are equal)"
                />
                <RadioCardRoot
                  ref={scrollingAreaRef as React.RefObject<HTMLDivElement>}
                  h="450px"
                  overflowY="auto"
                  value={tempInnerItemSelected}
                  onValueChange={handleSelectedInnerItemChange}
                >
                  <Flex wrap="wrap" gap={2}>
                    {displayedInnerItemIds.map((id) => (
                      <RadioCardItem
                        key={id}
                        w="fit"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        h="2em"
                        label={id}
                        value={id}
                        indicator={false}
                        _checked={{
                          "borderColor": "orange.900",
                          "--shadow-color": "colors.orange.900",
                          "backgroundColor": "orange.700"
                        }}
                        cursor="pointer"
                      />
                    ))}
                  </Flex>
                </RadioCardRoot>
              </Stack>
              <PaginationRoot
                position="absolute"
                bottom={4}
                w="full"
                variant="solid"
                count={filteredInnerItemIds.length}
                pageSize={pageLimit}
                defaultPage={1}
                py={3}
                onPageChange={handlePageChange}
                page={page}
                display="flex"
                justifyContent="center"
                gap={2}
              >
                <PaginationPrevTrigger />
                <PaginationItems />
                <PaginationNextTrigger />
              </PaginationRoot>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

function ItemIdPicker({ slotId, ids }: { slotId: number; ids: string[] }) {
  const { slot, setEdits } = useEditorStore((s) => ({ slot: s.edits.playerInventory[slotId], setEdits: s.setEdits }))
  const [searchQuery, setSearchQuery] = useState("")
  const searcher = useRef(new FuzzySearch(ids))
  const slotType = getSlotType(slot)
  const [tempIdSelected, setTempIdSelected] = useState(slotType === SlotType.Empty ? "" : slot.members[0].item_id)
  const scrollingAreaRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(1)
  const pageLimit = 40

  const handlePageChange = (e: { page: number }) => {
    setPage(e.page)
    scrollingAreaRef.current?.scrollTo(0, 0)
  }

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleDialogExit = () => {
    setTempIdSelected(slotType === SlotType.Empty ? "" : slot.members[0].item_id) // this is important for when the dialog closes without clicking "Save" (e.g clicking outside)
    setSearchQuery("")
  }

  const handleSelectedIdChange = (e: { value: string }) => {
    setTempIdSelected(e.value)
  }

  const handleSave = () => {
    setEdits((draft) => {
      draft.playerInventory[slotId].members = [
        {
          auto_use: false,
          cosmetic: null,
          animal_cosmetic: null,
          gold_to_gain: null,
          infusion: null,
          inner_item: null,
          item_id: tempIdSelected
        }
      ]
    })
  }

  const specialIds = ["purse", "cosmetic", "recipe_scroll", "crafting_scroll"] as const
  const filteredIds = searcher.current.search(searchQuery.replaceAll(" ", "_").toLowerCase()) as string[]
  const displayedIds = filteredIds.slice((page - 1) * pageLimit, page * pageLimit)

  return (
    <Dialog.Root size="xl" placement="top" onExitComplete={handleDialogExit}>
      <Dialog.Trigger asChild>
        <Button variant="outline" overflow="hidden" justifyContent="flex-start" textOverflow="ellipsis">
          {tempIdSelected === "" ? "Empty" : tempIdSelected}
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content mt="10" h="720px" textStyle="lg">
            <Dialog.Header>
              <HStack justifyContent="space-between">
                <HStack>
                  <Image src={editIcon} w="24px" h="24px" />
                  <Text>Item ID Picker</Text>
                </HStack>
                <HStack>
                  <Text textStyle="md">
                    Selected id: {tempIdSelected ? <Code textStyle="xl">{tempIdSelected}</Code> : "None"}
                  </Text>
                  <Dialog.ActionTrigger asChild>
                    <Button disabled={!tempIdSelected} onClick={handleSave} bg="green.600" _hover={{ opacity: 0.9 }} h="9">
                      Save
                    </Button>
                  </Dialog.ActionTrigger>
                </HStack>
              </HStack>
            </Dialog.Header>
            <Dialog.Body position="relative">
              <Stack gap={4}>
                <Input
                  autoFocus
                  value={searchQuery}
                  autoCorrect="off"
                  onChange={handleSearchQueryChange}
                  placeholder="Search for an id... (tip: 'fuzzy_moth', 'fuzzy moth' and ' fuzZy MoTH' are equal)"
                />
                <RadioCardRoot
                  ref={scrollingAreaRef as React.RefObject<HTMLDivElement>}
                  h="400px"
                  overflowY="auto"
                  value={tempIdSelected}
                  onValueChange={handleSelectedIdChange}
                >
                  <Flex wrap="wrap" gap={2}>
                    {displayedIds.map((id) => (
                      <RadioCardItem
                        key={id}
                        w="fit"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        h="2em"
                        label={id}
                        value={id}
                        indicator={false}
                        _checked={{
                          "borderColor": "orange.900",
                          "--shadow-color": "colors.orange.900",
                          "backgroundColor": "orange.700"
                        }}
                        cursor="pointer"
                      />
                    ))}
                  </Flex>
                </RadioCardRoot>
              </Stack>
              <Stack>
                <Text>Special ids</Text>
                <RadioCardRoot value={tempIdSelected} onValueChange={handleSelectedIdChange}>
                  <HStack>
                    {specialIds.map((id) => (
                      <RadioCardItem
                        key={id}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        h="2em"
                        label={id}
                        value={id}
                        indicator={false}
                        _checked={{
                          "borderColor": "orange.900",
                          "--shadow-color": "colors.orange.900",
                          "backgroundColor": "orange.700"
                        }}
                        cursor="pointer"
                      />
                    ))}
                  </HStack>
                </RadioCardRoot>
              </Stack>
              <PaginationRoot
                position="absolute"
                bottom={4}
                w="full"
                variant="solid"
                count={filteredIds.length}
                pageSize={pageLimit}
                defaultPage={1}
                py={3}
                onPageChange={handlePageChange}
                page={page}
                display="flex"
                justifyContent="center"
                gap={2}
              >
                <PaginationPrevTrigger />
                <PaginationItems />
                <PaginationNextTrigger />
              </PaginationRoot>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

function VersionPicker({
  versions,
  activeVersion,
  onVersionChange
}: {
  versions: Version[]
  activeVersion: Version
  onVersionChange: (v: Version) => void
}) {
  const versionsCollection = createListCollection({
    items: versions.map((v) => ({ label: v, value: v }))
  })

  return (
    <Select.Root
      w="120px"
      onValueChange={(e) => onVersionChange(e.value[0] as Version)}
      value={[activeVersion]}
      collection={versionsCollection}
    >
      <Select.Label>Items Version</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText />
          <Select.Indicator />
        </Select.Trigger>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content w="100px">
            {versionsCollection.items.map((item) => (
              <Select.Item item={item} key={item.value}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  )
}

function getSlotType(slot: Slot): SlotType {
  if (slot.members.length === 0) {
    return SlotType.Empty
  }

  switch (slot.members[0].item_id) {
    case "purse":
      return SlotType.Purse
    case "cosmetic":
      return SlotType.Cosmetic
    case "animal_cosmetic":
      return SlotType.AnimalCosmetic
    case "crafting_scroll":
      return SlotType.Furniture
    case "recipe_scroll":
      return SlotType.Cooking
    default:
      return SlotType.Item
  }
}
