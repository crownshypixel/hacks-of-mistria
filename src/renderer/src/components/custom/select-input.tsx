import { HStack, ListCollection } from "@chakra-ui/react"
import {
  SelectRoot,
  SelectLabel,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem
} from "src/components/primitives/select"

export const SelectInput = function ({
  collection,
  textLabel,
  value,
  onValueChange,
  placeholder,
  ...rest
}: {
  collection: ListCollection
  textLabel: string
  value: any
  onValueChange: (val: any) => void
  placeholder?: string
  [rest: string]: any
}) {
  return (
    <SelectRoot collection={collection} value={[value]} onValueChange={(e) => onValueChange(e.value[0])} {...rest}>
      <SelectLabel w="fit">{textLabel}</SelectLabel>
      <SelectTrigger>
        <SelectValueText placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {collection.items.map((item) => (
          <SelectItem item={item} key={item.value}>
            <HStack>
              {item.label}
              {item?.icon}
            </HStack>
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  )
}
