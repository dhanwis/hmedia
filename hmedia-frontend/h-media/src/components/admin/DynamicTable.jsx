// import { Inbox, Search } from "lucide-react";
// import { useState } from "react";

// export default function DynamicTable({
//  columns,
//   data,
//   uniqueKeyAccessor = "id",
//   search = true,
//   searchTerm,
//   onSearch,
//   searchAccessor = "slug",
// }) {
//   const [popupImage, setPopupImage] = useState(null);
//   if (!columns || !data) {
//     return <p>Table configuration or data is missing.</p>;
//   }

  

//   return (
//     <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
//       {/* Search Box */}
//       {search && (
//         <>
//           <div className="p-4 border-b">
//             <div className="relative w-full sm:w-72">
//               <Search
//                 size={16}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//               />
//               <input
//                 type="text"
//                 placeholder={`Search by ${searchAccessor}...`}
//                value={searchTerm}
// onChange={(e) => onSearch(e.target.value)}
//                 className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red"
//               />
//             </div>
//           </div>
//         </>
//       )}
//       <table className="w-full text-sm text-left text-gray-700 ">
//         <thead className="bg-gray-50 text-xs text-gray-600 uppercase tracking-wider font-medium">
//           <tr>
//             {columns.map((col) => (
//               <th
//                 key={col.header}
//                 scope="col"
//                 className={`px-6 py-3 whitespace-nowrap ${col.headerClassName || ""}`}
//               >
//                 {col.header}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {data.length > 0 ? (
//            data.map((row, index) => (
//               <tr
//                 key={row[uniqueKeyAccessor]}
//                 className="bg-white border-b border-gray-200 hover:bg-gray-50 last:border-b-0"
//               >
//                 {columns.map((col) => (
//                   <td
//                     key={`${row[uniqueKeyAccessor]}-${col.header}`}
//                     className={`px-6 py-4 whitespace-nowrap ${col.cellClassName || ""}`}
//                   >
//                     {col.type === "image" ? (
//                       <img
//                         src={row[col.accessor]}
//                         alt={row[col.altAccessor] || "Image"}
//                         className="h-14 w-20 object-cover rounded-md cursor-pointer"
//                       />
//                     ) : col.cell ? (
//                       col.cell(row, index)
//                     ) : (
//                       row[col.accessor]
//                     )}
//                   </td>
//                 ))}
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={columns.length} className="text-center py-16 px-4">
//                 <div className="flex flex-col items-center justify-center gap-4 text-gray-500">
//                   <Inbox size={48} className="text-gray-400" />
//                   <h3 className="text-lg font-semibold text-gray-700">
//                     No Items Found
//                   </h3>
//                   <p className="text-sm">
//                     There is no data to display at the moment.
//                   </p>
//                 </div>
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }


import { Inbox, Search } from "lucide-react";
import { useState } from "react";

export default function DynamicTable({
 columns,
  data,
  uniqueKeyAccessor = "id",
  search = true,
  searchTerm,
  onSearch,
  searchAccessor = "slug",
}) {
  const [popupImage, setPopupImage] = useState(null);
  if (!columns || !data) {
    return <p>Table configuration or data is missing.</p>;
  }

  

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
      {/* Search Box */}
      {search && (
        <>
          <div className="p-4 border-b">
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder={`Search by ${searchAccessor}...`}
               value={searchTerm}
onChange={(e) => onSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
          </div>
        </>
      )}
      <table className="w-full text-sm text-left text-gray-700 ">
        <thead className="bg-gray-50 text-xs text-gray-600 uppercase tracking-wider font-medium">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                scope="col"
                className={`px-6 py-3 whitespace-nowrap ${col.headerClassName || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
           data.map((row, index) => (
              <tr
                key={row[uniqueKeyAccessor]}
                className="bg-white border-b border-gray-200 hover:bg-gray-50 last:border-b-0"
              >
                {columns.map((col) => (
                  <td
                    key={`${row[uniqueKeyAccessor]}-${col.header}`}
                    className={`px-6 py-4 whitespace-nowrap ${col.cellClassName || ""}`}
                  >
                    {/* {col.type === "image" ? (
                      <img
                        src={row[col.accessor]}
                        alt={row[col.altAccessor] || "Image"}
                        className="h-14 w-20 object-cover rounded-md cursor-pointer"
                      /> */}
                      {col.type === "image" ? (
  row.ad_type === "video" ? (
    <video
      src={row[col.accessor]}
      className="h-14 w-24 object-cover rounded-md"
      muted
      playsInline
      preload="auto"
      
    />
  ) : (
    <img
      src={row[col.accessor]}
      alt={row[col.altAccessor] || "Image"}
      className="h-14 w-20 object-cover rounded-md cursor-pointer"
    />
  )

                    ) : col.cell ? (
                      col.cell(row, index)
                    ) : (
                      row[col.accessor]
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-16 px-4">
                <div className="flex flex-col items-center justify-center gap-4 text-gray-500">
                  <Inbox size={48} className="text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-700">
                    No Items Found
                  </h3>
                  <p className="text-sm">
                    There is no data to display at the moment.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}