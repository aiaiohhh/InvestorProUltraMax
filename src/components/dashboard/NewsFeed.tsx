'use client';

import { mockNews } from '@/data/mockData';
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { formatDistanceToNow, parseISO } from 'date-fns';

export function NewsFeed() {
  return (
    <div className="panel h-full">
      <div className="px-6 py-4 border-b border-midnight-500/50">
        <h3 className="text-lg font-semibold text-white">Market News</h3>
        <p className="text-sm text-white/50">Latest updates</p>
      </div>

      <div className="divide-y divide-midnight-600/50 max-h-[500px] overflow-y-auto">
        {mockNews.map((news) => (
          <article
            key={news.id}
            className="p-4 hover:bg-midnight-700/30 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className={clsx(
                'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                news.sentiment === 'positive' && 'bg-electric-green/10 text-electric-green',
                news.sentiment === 'negative' && 'bg-electric-red/10 text-electric-red',
                news.sentiment === 'neutral' && 'bg-white/10 text-white/50'
              )}>
                {news.sentiment === 'positive' && <TrendingUp className="w-4 h-4" />}
                {news.sentiment === 'negative' && <TrendingDown className="w-4 h-4" />}
                {news.sentiment === 'neutral' && <Minus className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white leading-snug mb-1 
                               group-hover:text-electric-cyan transition-colors">
                  {news.title}
                </h4>
                <p className="text-xs text-white/50 line-clamp-2 mb-2">
                  {news.summary}
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-white/40">{news.source}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/40">
                    {formatDistanceToNow(parseISO(news.publishedAt), { addSuffix: true })}
                  </span>
                  {news.relatedAssets && news.relatedAssets.length > 0 && (
                    <>
                      <span className="text-white/30">•</span>
                      <div className="flex gap-1">
                        {news.relatedAssets.map((asset) => (
                          <span
                            key={asset}
                            className="px-1.5 py-0.5 rounded bg-midnight-600 text-electric-cyan text-[10px] font-mono"
                          >
                            {asset}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button className="flex-shrink-0 p-2 rounded-lg text-white/30 hover:text-white 
                                 hover:bg-midnight-600 opacity-0 group-hover:opacity-100 transition-all">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="p-4 border-t border-midnight-500/50">
        <button className="w-full py-2 text-sm text-electric-cyan hover:text-electric-cyan/80 transition-colors">
          View All News →
        </button>
      </div>
    </div>
  );
}

