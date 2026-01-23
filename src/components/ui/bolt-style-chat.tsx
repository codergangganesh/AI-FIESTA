'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
    Plus, Lightbulb, Paperclip, Image, FileCode,
    ChevronDown, Check, Sparkles, Zap, Brain,
    SendHorizontal
} from 'lucide-react'

// TYPES
export interface Model {
    id: string
    name: string
    description?: string
    icon?: React.ReactNode
    badge?: string
    provider?: string
}

// MODEL SELECTOR
export function ModelSelector({
    selectedModels = [],
    onModelToggle,
    availableModels = [],
    darkMode = true
}: {
    selectedModels?: string[]
    onModelToggle?: (modelId: string) => void
    availableModels?: Model[]
    darkMode?: boolean
}) {
    const [isOpen, setIsOpen] = useState(false)

    // Find full model objects for selected IDs
    const selectedModelObjects = availableModels.filter(m => selectedModels.includes(m.id));
    const displayModel = selectedModelObjects.length > 0 ? selectedModelObjects[0] : availableModels[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 group ${darkMode
                    ? 'text-[#8a8a8f] hover:text-white hover:bg-white/5'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-black/5'
                    }`}
            >
                <span className={`transition-colors ${darkMode ? 'text-white group-hover:text-blue-300' : 'text-slate-800 group-hover:text-blue-600'}`}>
                    {selectedModels.length > 0 ? `${selectedModels.length} Models` : 'Select Model'}
                </span>
                <ChevronDown className={`size-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className={`absolute bottom-full left-0 mb-2 z-50 min-w-[240px] backdrop-blur-xl border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 ${darkMode
                        ? 'bg-[#1a1a1e]/95 border-white/10 shadow-black/50'
                        : 'bg-white/95 border-slate-200 shadow-slate-200/50'
                        }`}>
                        <div className="p-1.5">
                            <div className={`px-2.5 py-1.5 flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider ${darkMode ? 'text-[#5a5a5f]' : 'text-slate-400'
                                }`}>
                                <span>Select Models (Max 3)</span>
                                <span className={`${selectedModels.length === 3 ? 'text-blue-400' : ''}`}>{selectedModels.length}/3</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {availableModels.map((model) => {
                                    const isSelected = selectedModels.includes(model.id);
                                    return (
                                        <button
                                            key={model.id}
                                            onClick={() => onModelToggle?.(model.id)}
                                            className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-left transition-all duration-150 ${darkMode
                                                ? (isSelected ? 'bg-white/10 text-white' : 'text-[#a0a0a5] hover:bg-white/5 hover:text-white')
                                                : (isSelected ? 'bg-black/5 text-slate-900' : 'text-slate-500 hover:bg-black/5 hover:text-slate-900')
                                                }`}
                                        >
                                            <div className="flex-shrink-0">
                                                {model.icon || <Sparkles className="size-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium truncate">{model.name}</span>
                                                    {model.badge && (
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${model.badge === 'Pro' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                                                            }`}>
                                                            {model.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-[#6a6a6f] truncate block">{model.description}</span>
                                            </div>
                                            {isSelected && <Check className="size-4 text-blue-400 flex-shrink-0" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

// CHAT INPUT
export function ChatInput({
    onSend,
    placeholder = "What do you want to build?",
    value = '',
    onChange,
    selectedModels = [],
    onModelToggle,
    availableModels = [],
    darkMode = true
}: {
    onSend?: () => void
    placeholder?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    selectedModels?: string[]
    onModelToggle?: (modelId: string) => void
    availableModels?: Model[]
    darkMode?: boolean
}) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`
        }
    }, [value])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend?.()
        }
    }

    return (
        <div className="relative w-full max-w-[1000px] mx-auto z-30">
            {/* Glow Effects */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />

            {/* Main Container */}
            <div className={`relative rounded-2xl backdrop-blur-xl ring-1 shadow-2xl transition-all duration-300 ${darkMode
                ? 'bg-[#1e1e22]/90 ring-white/[0.1] shadow-black/50 focus-within:ring-white/[0.2] focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_12px_60px_rgba(0,0,0,0.6)]'
                : 'bg-[#1e1e22]/90 ring-black/[0.1] shadow-blue-500/10 focus-within:ring-black/[0.2] focus-within:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_12px_40px_rgba(0,0,0,0.2)]'
                }`}>
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={onChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={`w-full resize-none bg-transparent text-[18px] placeholder-[#5a5a5f] px-6 pt-6 pb-4 focus:outline-none min-h-[120px] max-h-[400px] text-white placeholder:text-gray-500`}
                        style={{ height: '120px' }}
                    />
                </div>

                <div className="flex items-center justify-between px-4 pb-4 pt-2">
                    <div className="flex items-center gap-3">
                        <ModelSelector
                            selectedModels={selectedModels}
                            onModelToggle={onModelToggle}
                            availableModels={availableModels}
                            darkMode={true}
                        />
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onSend}
                            disabled={!value?.trim()}
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1488fc] hover:bg-[#1a94ff] text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-[0_0_20px_rgba(20,136,252,0.3)] hover:shadow-[0_0_25px_rgba(20,136,252,0.5)]"
                        >
                            <SendHorizontal className="size-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
