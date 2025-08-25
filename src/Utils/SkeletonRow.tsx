interface SkeletonRowProps {
  columns: number;
}

const SkeletonRow = ({ columns }: SkeletonRowProps) => {
  return (
    <tr className="animate-pulse border-b border-gray-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </td>
      ))}
    </tr>
  );
};

export default SkeletonRow;
