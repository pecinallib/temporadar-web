import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TabType = 'clima' | 'marine' | 'historico' | 'mapa';

interface Tab {
  id: TabType;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex items-center gap-1 p-1 rounded-2xl
                bg-tr-paper/80 dark:bg-tr-dark-card/80
                border border-tr-ink/8 dark:border-tr-dark-ink/8
                backdrop-blur-sm shadow-sm w-fit"
    >
      <button
        *ngFor="let tab of tabs"
        (click)="selectTab(tab.id)"
        [class]="getTabClass(tab.id)"
      >
        <span class="text-base">{{ tab.icon }}</span>
        <span class="font-inter text-[13px] font-medium tracking-wide">
          {{ tab.label }}
        </span>
      </button>
    </div>
  `,
})
export class TabBarComponent {
  @Input() activeTab: TabType = 'clima';
  @Output() tabChanged = new EventEmitter<TabType>();

  tabs: Tab[] = [
    { id: 'clima', label: 'Clima', icon: '🌤️' },
    { id: 'marine', label: 'Marine', icon: '🌊' },
    { id: 'historico', label: 'Histórico', icon: '📊' },
    { id: 'mapa', label: 'Mapa', icon: '🗺️' },
  ];

  selectTab(tab: TabType): void {
    this.tabChanged.emit(tab);
  }

  getTabClass(tab: TabType): string {
    const base =
      'flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200';
    return tab === this.activeTab
      ? `${base} bg-tr-ink dark:bg-tr-terra text-tr-cream shadow-sm`
      : `${base} text-tr-ink-soft dark:text-tr-dark-soft hover:bg-tr-sand/50 dark:hover:bg-tr-dark-sand/50`;
  }
}
