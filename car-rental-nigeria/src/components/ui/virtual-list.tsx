// components/ui/virtual-list.tsx
"use client"

import React, { useMemo, useRef, useEffect, useState } from 'react'
import { FixedSizeList as List } from 'react-window'

interface VirtualListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (props: { index: number; style: React.CSSProperties; data: T }) => React.ReactNode
  className?: string
  overscanCount?: number
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  overscanCount = 5,
}: VirtualListProps<T>) {
  const listRef = useRef<List>(null)

  const itemData = useMemo(() => items, [items])

  const Item = ({ index, style, data }: { index: number; style: React.CSSProperties; data: T[] }) => {
    return renderItem({ index, style, data: data[index] })
  }

  return (
    <div className={className}>
      <List
        ref={listRef}
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={overscanCount}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {Item}
      </List>
    </div>
  )
}

// Hook for virtual scrolling with dynamic heights
export function useVirtualScroll<T>(
  items: T[],
  containerHeight: number,
  estimatedItemHeight: number = 200
) {
  const [scrollOffset, setScrollOffset] = useState(0)
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollOffset / estimatedItemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / estimatedItemHeight) + 1,
      items.length
    )

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
    }))
  }, [items, scrollOffset, containerHeight, estimatedItemHeight])

  const totalHeight = items.length * estimatedItemHeight

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    setScrollOffset(target.scrollTop)
  }

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    setContainerRef,
  }
}




