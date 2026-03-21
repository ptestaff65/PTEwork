import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../../../firebase/firebase.ts"
import Header from "../../../components/Header"
import { useAuth } from "../../../hooks/useAuth"
import type { SelectedEquipment } from "../../../App"

interface CompletionPageProps {
  cartItems: SelectedEquipment[]
  setCartItems: (items: SelectedEquipment[]) => void
}

export default function CompletionPage({ cartItems, setCartItems }: CompletionPageProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [fullName, setFullName] = useState<string>("")

  // Get borrow info from sessionStorage
  const borrowInfo = JSON.parse(sessionStorage.getItem("borrowInfo") || "{}")
  const expectedReturnTime = borrowInfo.expectedReturnTime || ""
  const borrowType = borrowInfo.borrowType || ""

  // Fetch user's fullName from Firestore
  useEffect(() => {
    const fetchUserFullName = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setFullName(userDoc.data().fullName || "")
          }
        } catch (error) {
          console.error("Error fetching user fullName:", error)
        }
      }
    }
    fetchUserFullName()
  }, [user])

  // Get current date and return date (same day)
  const today = new Date()
  const borrowDate = today.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit"
  })
  const borrowTime = today.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit"
  })
  const returnDate = today.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit"
  })

  const getBorrowTypeLabel = () => {
    switch (borrowType) {
      case "during-class":
        return "ยืมในคาบเรียน"
      case "teaching":
        return "ยืมใช้สอน"
      case "outside":
        return "ยืมนอกคาบเรียน"
      default:
        return "ยืมอุปกรณ์"
    }
  }

  return (
    <div
      className="
        min-h-screen
        bg-white
        bg-[radial-gradient(#dbeafe_1px,transparent_1px)]
        bg-[length:18px_18px]
      "
    >
      {/* ===== SUCCESS HEADER ===== */}
      <Header title="ทำการยืมสำเร็จ" />

      {/* ===== CONTENT ===== */}
      <div className="mt-6 flex justify-center">
        <div className="w-full max-w-[360px] px-4 flex flex-col items-center">
          {/* Borrowing Details */}
          <div className="w-full bg-gray-100 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg">👤</span>
              <span className="text-gray-700">{fullName || "ไม่ระบุชื่อ"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>📦</span>
              <span>ประเภทการยืม: {getBorrowTypeLabel()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>📅</span>
              <span>ยืมวันที่ {borrowDate} เวลา {borrowTime} น.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>📋</span>
              <span>กำหนดคืน {returnDate} เวลา {expectedReturnTime || borrowTime} น.</span>
            </div>
          </div>

          {/* Equipment Summary */}
          <div className="w-full mb-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 mb-3 border border-gray-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      {item.equipmentTypes?.length ? (
                        <>
                          {item.equipmentTypes.join(", ")}
                          {item.equipmentSubTypes?.length && ` - ${item.equipmentSubTypes.join(", ")}`}
                        </>
                      ) : (
                        "ไม่ระบุประเภท"
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{item.selectedQuantity}</p>
                    <p className="text-xs text-gray-500">{item.unit || "ชิ้น"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Completion Button */}
          <button
            onClick={() => {
              setCartItems([])
              navigate('/home')
            }}
            className="
              w-full
              px-6 py-2
              rounded-full
              bg-orange-500
              text-white
              text-sm font-medium
              hover:bg-orange-600
              transition
              mb-6
            "
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  )
}
