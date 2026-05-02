import {
  type DefaultNodeTypes,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  type JSXConvertersFunction,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { cn } from '@/utilities/ui'

const baseConverters: JSXConvertersFunction<DefaultNodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
})

type Props = {
  data: DefaultTypedEditorState
  enableProse?: boolean
  converters?: JSXConvertersFunction<DefaultNodeTypes>
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, converters, ...rest } = props
  return (
    <ConvertRichText
      converters={converters ?? baseConverters}
      className={cn('payload-richtext', { 'mx-auto prose md:prose-md dark:prose-invert': enableProse }, className)}
      {...rest}
    />
  )
}
