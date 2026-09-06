'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Transaction } from '@/lib/types';
import { ShieldCheck, DollarSign, Users, Search, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'initialized' | 'failed'>('all');

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Compute revenue analytics
  const successfulTx = transactions.filter((t) => t.status === 'success');
  const revenueNgn = successfulTx
    .filter((t) => t.currency === 'NGN')
    .reduce((sum, t) => sum + t.amount, 0) / 100;
  const revenueUsd = successfulTx
    .filter((t) => t.currency === 'USD')
    .reduce((sum, t) => sum + t.amount, 0) / 100;

  const conversionRate = transactions.length > 0
    ? Math.round((successfulTx.length / transactions.length) * 100)
    : 0;

  // Filtered list
  const filtered = transactions.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      t.reference.toLowerCase().includes(query) ||
      t.authorHandle.toLowerCase().includes(query) ||
      t.wordText.toLowerCase().includes(query) ||
      t.payerEmail.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Navigation back */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-ink-muted hover:text-stamp-red"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Live Sentence</span>
          </Link>
          <button
            onClick={fetchTransactions}
            className="flex items-center gap-1.5 px-3 py-1 bg-paper-200 border border-ink text-xs font-mono font-bold uppercase hover:bg-paper-300 btn-brutal cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Ledger</span>
          </button>
        </div>

        {/* Header */}
        <div className="border-b-2 border-ink pb-4 mb-8">
          <div className="text-[10px] font-mono tracking-widest uppercase text-stamp-red font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OPERATOR COMMAND & FINANCIAL LEDGER</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-black text-ink uppercase">
            Admin Intelligence & Revenue
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted font-serif italic mt-1">
            Real-time telemetry, Paystack settlement audit, and conversion analytics.
          </p>
        </div>

        {/* High-Level Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="paper-card p-5 bg-paper-50">
            <div className="text-[11px] font-mono uppercase text-ink-muted mb-1">Total Naira Revenue</div>
            <div className="font-editorial text-2xl sm:text-3xl font-black text-ink">
              ₦{revenueNgn.toLocaleString()}
            </div>
            <div className="text-[10px] text-ink-faint font-mono mt-1">Settled via Paystack NGN</div>
          </div>

          <div className="paper-card p-5 bg-paper-50">
            <div className="text-[11px] font-mono uppercase text-ink-muted mb-1">Total USD Revenue</div>
            <div className="font-editorial text-2xl sm:text-3xl font-black text-emerald-800">
              ${revenueUsd.toFixed(2)}
            </div>
            <div className="text-[10px] text-ink-faint font-mono mt-1">Settled via Paystack USD</div>
          </div>

          <div className="paper-card p-5 bg-paper-50">
            <div className="text-[11px] font-mono uppercase text-ink-muted mb-1">Total Inscriptions</div>
            <div className="font-editorial text-2xl sm:text-3xl font-black text-ink">
              {successfulTx.length} Words
            </div>
            <div className="text-[10px] text-ink-faint font-mono mt-1">Successful ledger placements</div>
          </div>

          <div className="paper-card p-5 bg-paper-50">
            <div className="text-[11px] font-mono uppercase text-ink-muted mb-1">Conversion Rate</div>
            <div className="font-editorial text-2xl sm:text-3xl font-black text-stamp-red">
              {conversionRate}%
            </div>
            <div className="text-[10px] text-ink-faint font-mono mt-1">
              {transactions.length} total checkout attempts
            </div>
          </div>
        </div>

        {/* Transactions Table Section */}
        <div className="paper-card p-6 bg-paper-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-ink pb-4 mb-4">
            <h2 className="font-editorial font-bold text-xl text-ink uppercase">
              Financial Audit Ledger ({filtered.length})
            </h2>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center border border-ink bg-paper-100 px-2 py-1">
                <Search className="w-3.5 h-3.5 text-ink-muted mr-1.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ref, @handle..."
                  className="bg-transparent text-xs font-mono focus:outline-none w-36 sm:w-44"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as unknown as typeof statusFilter)}
                className="border border-ink bg-paper-100 px-2 py-1 text-xs font-mono font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="initialized">Initialized</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="py-12 text-center font-mono text-xs text-ink-muted">
              Loading financial transactions...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center font-mono text-xs text-ink-muted">
              No transactions match the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs divide-y divide-ink/10">
                <thead>
                  <tr className="text-ink-muted uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Author</th>
                    <th className="py-2.5 px-3">Word</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {filtered.map((t) => (
                    <tr key={t.id || t.reference} className="hover:bg-paper-100 transition-colors">
                      <td className="py-2.5 px-3 text-ink-faint whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString()}{' '}
                        {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-ink truncate max-w-[140px]" title={t.reference}>
                        {t.reference}
                      </td>
                      <td className="py-2.5 px-3 text-ink font-bold">
                        @{t.authorHandle}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-typewriter font-bold text-ink">
                          &ldquo;{t.wordText}&rdquo;
                        </span>
                        <span className="ml-1 text-[10px] text-ink-muted uppercase">
                          ({t.modifierType})
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        {t.currency === 'USD' ? `$${(t.amount / 100).toFixed(2)}` : `₦${(t.amount / 100).toLocaleString()}`}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                            t.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-700'
                              : t.status === 'initialized'
                              ? 'bg-amber-100 text-amber-800 border-amber-600'
                              : 'bg-red-100 text-red-800 border-red-600'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
