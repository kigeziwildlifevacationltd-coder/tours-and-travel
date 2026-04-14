import gorillaImg from "@/assets/images/gorilla-closeup-in-jungle-0044.jpg";
import treeLionsImg from "@/assets/images/tree-climbing-lionesses-resting-0063.jpg";
import chimpImg from "@/assets/images/chimpanzee-portrait-in-greenery-0057.jpg";
import murchisonImg from "@/assets/images/waterfall-rapids-landscape-0043.jpg";
import lakeBunyonyiImg from "@/assets/images/lake-islands-overlook-0031.jpg";

const imageMap: Record<string, string> = {
  gorilla: gorillaImg,
  "tree-lions": treeLionsImg,
  chimp: chimpImg,
  murchison: murchisonImg,
  "lake-bunyonyi": lakeBunyonyiImg,
};

export function getImage(key: string): string {
  return imageMap[key] || gorillaImg;
}
