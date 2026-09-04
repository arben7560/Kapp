import { ImmersionPlaceholder } from "../../components/immersion/ImmersionPlaceholder";

export default function SeongsuImmersionScreen() {
  return (
    <ImmersionPlaceholder
      imageSource={require("../../assets/immersion/seongsu.jpg")}
      title="Café calme à Seongsu"
      description="Décor posé, commandes simples, conversations basses et temps suspendu."
    />
  );
}
