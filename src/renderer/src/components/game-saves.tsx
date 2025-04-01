import { Box, Button, Center, Code, Flex, HStack, Input, VStack } from "@chakra-ui/react"
import { Fragment, useState } from "react"
import { useSaves } from "src/queries"
import { LoadingMessage } from "src/components/custom/loading"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot
} from "src/components/primitives/pagination"
import { SEASONS, translateCalendar } from "src/time-utils"
import { SaveCard } from "src/components/save-card"
import { AppPage, useActiveSaveId, useAppPage } from "src/store"
import { useQueryClient } from "@tanstack/react-query"
import { AlertNotes } from "src/components/custom/alert-notes"

export function GameSaves() {
  const { data: saves, isPending, isError, error } = useSaves()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const { setAppPage } = useAppPage()
  const pageLimit = 10
  const { setActiveSaveId } = useActiveSaveId()
  const queryClient = useQueryClient()

  if (isError)
    return (
      <Center>
        An error has occured <br />
        <Code textStyle="lg">{error.message}</Code>
      </Center>
    )

  if (isPending) {
    return (
      <Layout>
        <LoadingMessage message="Loading your saves" />
      </Layout>
    )
  }

  const pageChangeHandler = (e: { page: number }) => {
    setPage(e.page)
    window.scrollTo(0, 100)
  }

  const searchChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const saveClickHandler = (saveId: string) => {
    setAppPage(AppPage.SaveEditor)
    setActiveSaveId(saveId)
  }

  const reloadSavesHandler = async () => {
    await queryClient.resetQueries({ queryKey: ["default-saves"], exact: true })
  }

  const backToMenuHandler = () => {
    setAppPage(AppPage.Menu)
  }

  const sortedSaves = Object.values(saves).sort((a, b) => b.lastPlayed - a.lastPlayed)

  const filteredSaves = sortedSaves.filter((save) => {
    const query = search.toLowerCase()
    const season = SEASONS[translateCalendar(save.calendar).seasonIdx]
    const autosave = save.saveId.includes("autosave") ? "autosave" : ""

    return (
      save.playerName.toLowerCase().includes(query) ||
      save.farmName.toLowerCase().includes(query) ||
      season.toLowerCase().includes(query) ||
      autosave.toLowerCase().includes(query) ||
      save.saveId.includes(query)
    )
  })

  const startIdx = (page - 1) * pageLimit
  const endIdx = startIdx + pageLimit
  const displayedSaves = filteredSaves.slice(startIdx, endIdx)

  return (
    <Layout>
      <HStack w="full">
        <Button w="min" h="min-content" bg="blue.600" onClick={backToMenuHandler}>
          Go back to menu
        </Button>
        <Button w="min" h="min-content" bg="pink.600" onClick={reloadSavesHandler}>
          Reload saves
        </Button>
      </HStack>
      <Input
        w="full"
        borderWidth={3}
        placeholder="Search your saves by name, farm name, season, save id..."
        onChange={searchChangeHandler}
      />

      {displayedSaves.map((save) => (
        <Fragment key={save.saveId}>
          <SaveCard save={save} onClick={saveClickHandler} />
        </Fragment>
      ))}
      <PaginationRoot
        variant="solid"
        count={filteredSaves.length}
        pageSize={10}
        defaultPage={1}
        pt={5}
        onPageChange={pageChangeHandler}
        page={page}
        display="flex"
        justifyContent="center"
        gap={2}
      >
        <PaginationPrevTrigger />
        <PaginationItems />
        <PaginationNextTrigger />
      </PaginationRoot>
    </Layout>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  const maxWidth = 900
  const alertNotes = [
    "The saves are shown in the same order as in-game",
    "Some values like the time (clock, playtime) might slightly differ from in-game"
  ]

  return (
    <Box mx={3}>
      <VStack gap={4} mb={10} maxW={maxWidth} w="full" mx="auto">
        <Flex w="full" mt={4}>
          <AlertNotes notes={alertNotes} />
        </Flex>
        {children}
      </VStack>
    </Box>
  )
}
