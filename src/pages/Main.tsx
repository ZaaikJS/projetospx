import cards from "@/assets/images/cards.png"
import { useNavigate } from "react-router-dom";

export default function Main() {
  const navigate = useNavigate();

  return (
    <main className="h-[2000px] text-gray-950">
      <div className="grid grid-cols-4 p-8 bg-white w-full shadow-lg shadow-black/40">
        <div
          onClick={() => navigate('/main/cards')}
          className="p-4 flex flex-col gap-4 group bg-white border border-gray-200 shadow-lg hover:shadow-xl hover:shadow-black/20 duration-200 cursor-pointer"
        >
          <div className="w-fit h-52 overflow-hidden">
            <img src={cards} alt={"Lista de cards"} className="group-hover:scale-110 duration-400" />
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Criar grupo Whatsapp</p>
            <span className="text-xs">Visualize os cards em aberto e crie grupos a partir deles</span>
          </div>
        </div>
      </div>
    </main>
  );
}