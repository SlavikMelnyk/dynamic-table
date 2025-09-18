import React, { useContext, useMemo } from 'react';
import { PivotContext } from '../context/PivotContext';
import { getHeaderNodesAtDepth, pivotData } from '../utils';
import type { ColumnNode } from '../types';

export default function Table() {
    const { transactions, rowGroup, colGroups } = useContext(PivotContext);

    const { rowValues, columnTree, leaves, pivotMap, totalMap } = useMemo(
        () => pivotData(transactions, rowGroup, colGroups),
        [transactions, rowGroup, colGroups]
    );

    if (!transactions.length) return <p>Loading data...</p>;

    const headerDepth = colGroups.length || 1;

    const Cell: React.FC<{ rowValue?: string | number; leafNode?: ColumnNode; isTotal?: boolean }> = ({
        rowValue,
        leafNode,
        isTotal,
    }) => {
        let cellValue = 0;
        if (!colGroups.length) {
            cellValue = Number(isTotal ? (totalMap as number) : (pivotMap as any)[rowValue!]) || 0;
        } else {
            const baseAggregate = (isTotal ? totalMap : (pivotMap as any)[rowValue!]) ?? {};
            cellValue = leafNode!.fullPath.reduce<any>((accumulator, key) => (accumulator ? accumulator[key] : undefined), baseAggregate) ?? 0;
        }
        return <td className="border border-gray-300 px-3 py-1 text-right">
            <div className="flex justify-between">
                <span>$</span>
                <span>{cellValue.toFixed(2)}</span>
            </div>
        </td>;
    };

    return (
        <div className="overflow-x-auto mt-10">
            <table className="table-auto w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100 text-gray-700">
                    {colGroups.length ? (
                        <>
                            <tr>
                                <th scope="col" rowSpan={headerDepth} className="border border-gray-300 px-3 py-1 text-left" />
                                {columnTree.map(node => (
                                    <th
                                        key={String(node.value)}
                                        scope={node.children.length ? 'colgroup' : 'col'}
                                        colSpan={node.colSpan}
                                        className="border border-gray-300 px-3 py-1 text-center font-extrabold"
                                    >
                                        {String(node.value).replaceAll('_', ' ')}
                                    </th>
                                ))}
                            </tr>
                            {headerDepth > 1 &&
                                Array.from({ length: headerDepth - 1 }, (_, depthIndex) => (
                                    <tr key={`h-${depthIndex}`}>
                                        {getHeaderNodesAtDepth(columnTree, depthIndex + 1).map(node => (
                                            <th
                                                key={node.fullPath.join('|')}
                                                scope={node.children.length ? 'colgroup' : 'col'}
                                                colSpan={node.colSpan}
                                                className="border border-gray-300 px-3 py-1 text-center text-black"
                                            >
                                                {String(node.value).replaceAll('_', ' ')}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                        </>
                    ) : (
                        <tr>
                            <th scope="col" className="border border-gray-300 px-3 py-1 text-left">
                                {rowGroup}
                            </th>
                            <th scope="col" className="border border-gray-300 px-3 py-1 text-right">
                                Total
                            </th>
                        </tr>
                    )}
                </thead>
                <tbody>
                    {rowValues.map(rowValue => (
                        <tr key={String(rowValue)} className="even:bg-gray-100">
                            <th scope="row" className="border border-gray-300 px-3 py-1 text-left">
                                {String(rowValue).replaceAll('_', ' ')}
                            </th>
                            {leaves.map(leafNode => (
                                <Cell key={`${String(rowValue)}-${leafNode.fullPath.join('-')}`} rowValue={rowValue} leafNode={leafNode} />
                            ))}
                        </tr>
                    ))}
                    <tr className="font-extrabold bg-gray-100">
                        <th scope="row" className="border border-gray-300 px-3 py-1 text-left">
                            Total
                        </th>
                        {leaves.map(leafNode => (
                            <Cell key={`total-${leafNode.fullPath.join('-')}`} isTotal leafNode={leafNode} />
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
