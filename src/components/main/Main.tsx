import { useNavigate } from "react-router-dom";
import style from "./Main.module.scss";
import { useRef, useState, useEffect, Dispatch, FC } from "react";
import { TypeAction } from "../..";

interface IMain {
  set: Dispatch<TypeAction>;
}

const Main: FC<IMain> = ({ set }) => {
  const [status, setStatus] = useState<"start" | "turning" | "identification">(
    "start"
  );
  const navigate = useNavigate();

  const video = useRef<HTMLVideoElement>(null);

  let stream: MediaStream | null = null;

  useEffect(() => {
    return () => {
      setStatus("start");
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
      }
    };
  }, []);

  const handleStart = async () => {
    setStatus("turning");
    const constraints = {
      audio: false,
      video: { width: 320, height: 480, facingMode: "user" },
    };
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    const videoStream = video.current;
    if (!videoStream) return;
    videoStream.srcObject = stream;
    videoStream.onloadedmetadata = () => {
      setStatus("identification");
      videoStream.play();
      const canvas = document.createElement("canvas");
      canvas.width = videoStream.videoWidth;
      canvas.height = videoStream.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(videoStream, 0, 0, canvas.width, canvas.height);
      const formData = new FormData();
      formData.append("image", canvas.toDataURL("image/jpeg"));
      setTimeout(() => {
        set({
          type: "SET",
          payload: {
            status_code: 200,
            name: "Aynaz",
            surname: "Davletshin",
            middlename: "Khanifovich",
            cards: [
              {
                bank: "ВТБ",
                last_four_digits: 1234,
                cashback: [
                  {
                    product_type: "Одежда",
                    value: 10,
                  },
                ],
              },
              {
                bank: "Тинькофф",
                last_four_digits: 4013,
                cashback: null,
              },
            ],
          },
        });
        navigate("/payment");
      }, 2000);
    };
  };

  return (
    <div className={style.main}>
      <video ref={video} className={style.main__web_camera} />
      <button
        disabled={status === "identification" || status === "turning"}
        onClick={handleStart}
        className={style.main__start}
      >
        {status === "start" && "Начать"}
        {status === "turning" && "Включения камеры..."}
        {status === "identification" && "Идентификация пользователя..."}
      </button>
    </div>
  );
};

export default Main;
