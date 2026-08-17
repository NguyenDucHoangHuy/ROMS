import { useParams } from 'react-router-dom'

export default function MenuPage() {
  const { tableId } = useParams<{ tableId: string }>()
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Thực đơn</h1>
      <p className="text-gray-500 text-sm mt-1">Bàn: {tableId}</p>
      <p className="text-gray-400 text-xs mt-4">MenuPage — Coming soon</p>
    </div>
  )
}
