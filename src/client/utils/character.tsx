import { type ICharacterNode, type ICuratedCyberFrame, type INode } from '../types';

interface ICyberFrameLevels {
  cyberFrame: ICuratedCyberFrame;
  level: number;
  chosenNodes: INode[];
}

const getCyberFrameLevelsByNodes = (
  nodes: ICharacterNode[] | undefined,
  cyberFrames: ICuratedCyberFrame[]
): ICyberFrameLevels[] => {
  if (nodes === undefined) {
    return [];
  }
  const tempFrames: Record<string, ICyberFrameLevels> = {};
  nodes.forEach(({ node }) => {
    if (node.cyberFrameBranch !== undefined) {
      const foundCyberFrame = cyberFrames.find(
        ({ cyberFrame }) =>
          cyberFrame.branches.find(
            ({ cyberFrameBranch }) => cyberFrameBranch._id === node.cyberFrameBranch
          ) !== undefined
      );
      if (foundCyberFrame !== undefined) {
        if (tempFrames[foundCyberFrame.cyberFrame._id] === undefined) {
          tempFrames[foundCyberFrame.cyberFrame._id] = {
            cyberFrame: foundCyberFrame,
            level: 0,
            chosenNodes: [],
          };
        }
        tempFrames[foundCyberFrame.cyberFrame._id].level += 1;
        tempFrames[foundCyberFrame.cyberFrame._id].chosenNodes.push(node);
      }
    }
  });

  return Object.values(tempFrames);
};

export { getCyberFrameLevelsByNodes };
