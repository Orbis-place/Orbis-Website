'use client'

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface User {
  id: string;
  username: string;
  displayName?: string;
  image?: string;
  reputation: number;
}

interface UserSearchComboboxProps {
  onSelect: (user: User) => void;
  placeholder?: string;
  excludeUserIds?: string[];
}

export function UserSearchCombobox({ onSelect, placeholder = "Search users...", excludeUserIds = [] }: UserSearchComboboxProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 3) {
        setUsers([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/search?query=${encodeURIComponent(query)}&limit=10`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const data = await response.json();
          // Filter out excluded users
          const filteredData = data.filter((user: User) => !excludeUserIds.includes(user.id));
          setUsers(filteredData);
          setIsOpen(true);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error('Failed to search users:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query, excludeUserIds]);

  const handleSelect = (user: User) => {
    onSelect(user);
    setQuery('');
    setUsers([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || users.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % users.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (users[selectedIndex]) {
          handleSelect(users[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Icon
          icon="mdi:magnify"
          width="18"
          height="18"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 3 && users.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pl-10 pr-10"
        />
        {loading && (
          <Icon
            icon="mdi:loading"
            width="18"
            height="18"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin"
          />
        )}
        {query.length > 0 && query.length < 3 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {3 - query.length} more
          </span>
        )}
      </div>

      {isOpen && users.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {users.map((user, index) => (
            <button
              key={user.id}
              onClick={() => handleSelect(user)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors ${
                index === selectedIndex ? 'bg-accent' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.image ? (
                  <Image src={user.image} alt={user.username} width={40} height={40} className="rounded-full" />
                ) : (
                  <Icon icon="mdi:account" width="24" height="24" className="text-primary" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {user.displayName || user.username}
                </p>
                <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
              </div>
              {user.reputation > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon icon="mdi:star" width="14" height="14" className="text-yellow-500" />
                  {user.reputation}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && users.length === 0 && !loading && query.length >= 3 && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg p-4">
          <p className="text-sm text-muted-foreground text-center">No users found</p>
        </div>
      )}
    </div>
  );
}
