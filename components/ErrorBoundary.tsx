"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/5 text-center">
            <p className="text-red-400 font-bold text-lg mb-2">Une erreur est survenue</p>
            <p className="text-slate-400 text-sm">{this.state.error.message}</p>
            <button
              onClick={() => this.setState({ error: null })}
              className="mt-4 px-4 py-2 text-sm border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
            >
              Réessayer
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
