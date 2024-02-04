import { useEffect, useRef, useState } from "react";
import { BeatMachine } from "../../components/beatMachine/BeatMachine";
import { Button, Modal, Slider } from "@mui/material";
import "./DiscoBattle.scss";
import discoMusic from "../../assets/audio/funky-57sec.mp3";
import retroMusic from "../../assets/audio/retro-disco-old-school.mp3";
import discoCD from "../../assets/image/disco-cd.svg";
import Lottie from "react-lottie";
import flyingNotes from "../../assets/animations/floating-notes";
import speaker from "../../assets/animations/dancing-speaker";
import { guess } from "web-audio-beat-detector";

const speedMap = {
  100: "INSANE",
  75: "FAST",
  50: "MEDIUM",
  25: "SLOW",
};

const machineList = [
  { color: "#f7a76d", keyToListen: "ArrowLeft" },
  { color: "#fa70c3", keyToListen: "ArrowDown" },
  { color: "#5f98ed", keyToListen: "ArrowRight" },
];

export function DiscoBattle(props) {
  const [open, setOpen] = useState(true);
  const [speed, setSpeed] = useState(50);
  const [perfect, setPerfect] = useState(0);
  const [good, setGood] = useState(0);
  const [missed, setMissed] = useState(0);
  const [machineSet, setMachineSet] = useState([
    machineList[0],
    machineList[2],
  ]);
  const audio = useRef(null);

  const options = (animation) => {
    return {
      loop: true,
      autoplay: true,
      animationData: animation,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };
  };

  useEffect(() => {
    loadMusic();
    if (!open) {
      audio.current.playbackRate = 1;
      setTimeout(() => {
        audio.current.play();
      }, 1000 - 198 - 10);
    }
  }, [open]);

  const loadMusic = async () => {
    const audioContext = new window.AudioContext();

    const loadAudio = async (audioContext, audioPath) => {
      const response = await fetch(audioPath);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    };

    const audioBuffer = await loadAudio(audioContext, retroMusic);

    guess(audioBuffer)
      .then(({ bpm, offset, tempo }) => {
        console.log("BPM is" + bpm);
        console.log("OFFSET is" + offset);
        console.log("TEMPO is" + tempo);
      })
      .catch((err) => {
        // something went wrong
      });
  };

  const addPerfect = () => setPerfect((p) => p + 1);
  const addGood = () => setGood((g) => g + 1);
  const addMissed = () => setMissed((m) => m + 1);

  const setupMachines = (val) => {
    switch (val) {
      case 1:
        setMachineSet([machineList[0]]);
        break;
      case 2:
        setMachineSet([machineList[0], machineList[2]]);
        break;
      case 3:
        setMachineSet([machineList[0], machineList[1], machineList[2]]);
        break;
      default:
        break;
    }
  };

  return (
    <div id="disco-battle-page">
      <audio ref={audio} loop autoPlay={true} src={retroMusic}></audio>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="modal-box disco-battle">
          <div className="option-box">
            <h1 className="option-title">{speedMap[speed]}</h1>
            <Slider
              sx={{ width: "60%", height: "1rem" }}
              defaultValue={speed}
              step={25}
              min={25}
              max={100}
              onChange={(_, val) => setSpeed(val)}
            />
          </div>
          <div className="option-box">
            {machineSet.length == 1 && (
              <h1 className="option-title">
                USE <span style={{ fontWeight: 800 }}>SPACE</span> KEY
              </h1>
            )}
            {machineSet.length == 2 && (
              <h1 className="option-title">
                USE <b>&larr;</b> AND <b>&#8594;</b>
              </h1>
            )}
            {machineSet.length == 3 && (
              <h1 className="option-title">
                USE <span style={{ fontWeight: 800 }}>&#8592;</span>,
                <span style={{ fontWeight: 800 }}> &#8595;</span> AND
                <span style={{ fontWeight: 800 }}> &#8594;</span>
              </h1>
            )}

            <Slider
              sx={{ width: "60%", height: "1rem" }}
              defaultValue={2}
              step={1}
              min={1}
              max={3}
              onChange={(_, val) => setupMachines(val)}
            />
          </div>
          <Button
            style={{ width: "60%" }}
            variant="contained"
            onClick={() => setOpen(false)}
          >
            Start
          </Button>
        </div>
      </Modal>

      {/* <h1>Perfect: {perfect}</h1>
      <h1>Good: {good}</h1>
      <h1>Missed: {missed}</h1> */}
      {!open && (
        <div id="disco-battle-box">
          <div>
            <div style={{ width: "16rem" }}>
              <Lottie options={options(speaker)} />
            </div>
          </div>
          <div
            className="machine-box"
            style={{ maxWidth: machineSet.length * 200 }}
          >
            {machineSet.map((val, i) => (
              <BeatMachine
                key={i}
                speed={115}
                listenOn={val.keyToListen}
                onPerfect={addPerfect}
                onGood={addGood}
                onMissed={addMissed}
                beatsColor={val.color}
              ></BeatMachine>
            ))}
          </div>
        </div>
      )}
      <Lottie
        style={{
          position: "absolute",
        }}
        options={options(flyingNotes)}
      />
    </div>
  );
}
