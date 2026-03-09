"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getBrowserSupabaseClient } from "@/lib/supabase"

export function useRealtimeInvalidation(
  channelName: string,
  tables: string[],
  queryKeys: ReadonlyArray<readonly unknown[]>,
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = getBrowserSupabaseClient()
    const channel = supabase.channel(channelName)

    tables.forEach((table) => {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        () => {
          queryKeys.forEach((queryKey) => {
            queryClient.invalidateQueries({ queryKey: [...queryKey] })
          })
        },
      )
    })

    channel.subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [channelName, queryClient, queryKeys, tables])
}
