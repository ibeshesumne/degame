import React from 'react'

function EquilibriaDisplay({ equilibria, onFetchEquilibria }) {
  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Nash Equilibria</h2>
        <button
          onClick={onFetchEquilibria}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
        >
          Compute
        </button>
      </div>

      {equilibria ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">
              Found {equilibria.equilibria?.length || 0} equilibrium/equilibria
            </h3>
          </div>

          {equilibria.equilibria && equilibria.equilibria.length > 0 ? (
            <div className="space-y-3">
              {equilibria.equilibria.map((eq, idx) => (
                <div key={idx} className="p-3 bg-indigo-50 rounded border border-indigo-200">
                  <div className="font-semibold mb-1">Equilibrium {idx + 1}</div>
                  <div className="text-sm mb-2">
                    Strategies: {JSON.stringify(eq.strategies)}
                  </div>
                  <div className="text-sm">
                    Payoffs: {JSON.stringify(eq.payoffs)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No equilibria found</p>
          )}

          {equilibria.dominant_strategies && Object.keys(equilibria.dominant_strategies).length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Dominant Strategies:</h4>
              <div className="text-sm space-y-1">
                {Object.entries(equilibria.dominant_strategies).map(([player, strategy]) => (
                  <div key={player}>
                    {player}: {strategy}
                  </div>
                ))}
              </div>
            </div>
          )}

          {equilibria.pareto_efficient && equilibria.pareto_efficient.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Pareto Efficient Outcomes:</h4>
              <div className="text-sm space-y-2">
                {equilibria.pareto_efficient.map((pe, idx) => (
                  <div key={idx} className="p-2 bg-green-50 rounded">
                    {JSON.stringify(pe.strategies)} → {JSON.stringify(pe.payoffs)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Click "Compute" to analyze Nash equilibria</p>
      )}
    </div>
  )
}

export default EquilibriaDisplay
