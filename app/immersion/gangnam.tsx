import { ImmersionPlaceholder } from "../../components/immersion/ImmersionPlaceholder";

export default function GangnamImmersionScreen() {
  return (
    <ImmersionPlaceholder
      imageSource={require("../../assets/immersion/gangnam.jpg")}
      title="Sortie de métro à Gangnam"
      description="Flux pressé, panneaux colorés, repères urbains et directions multiples."
    />
  );
}
