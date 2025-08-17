'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { ExternalLink } from 'lucide-react'
import type { Gift } from '@/lib/types'

interface ShoppingModalProps {
  gift: Gift | null
  isOpen: boolean
  onClose: () => void
}

export function ShoppingModal({ gift, isOpen, onClose }: ShoppingModalProps) {
  if (!gift) return null

  const shoppingOptions = [
    {
      name: 'Amazon',
      url: `https://www.amazon.com/s?k=${encodeURIComponent(gift.name + ' ' + gift.brand)}`,
      logo: '/amazon-logo.png',
      description: 'Fast delivery, Prime eligible'
    },
    {
      name: 'Target',
      url: `https://www.target.com/s?searchTerm=${encodeURIComponent(gift.name)}`,
      logo: '/target-logo.png',
      description: 'In-store pickup available'
    },
    {
      name: 'Walmart',
      url: `https://www.walmart.com/search?q=${encodeURIComponent(gift.name + ' ' + gift.brand)}`,
      logo: '/walmart-logo.png',
      description: 'Everyday low prices'
    },
    {
      name: 'Best Buy',
      url: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(gift.name)}`,
      logo: '/bestbuy-logo.png',
      description: 'Tech expert support'
    },
    {
      name: 'Google Shopping',
      url: `https://www.google.com/search?q=${encodeURIComponent(gift.name + ' ' + gift.brand + ' buy')}&tbm=shop`,
      logo: '/google-logo.png',
      description: 'Compare prices from all retailers'
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Where to buy: {gift.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {shoppingOptions.map((option) => (
            <div
              key={option.name}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-sm font-medium">{option.name[0]}</span>
                </div>
                <div>
                  <h3 className="font-medium">{option.name}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(option.url, '_blank')
                  onClose()
                }}
                className="flex items-center space-x-1"
              >
                <span>Shop</span>
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-gray-500 text-center">
            Prices and availability may vary by retailer
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
