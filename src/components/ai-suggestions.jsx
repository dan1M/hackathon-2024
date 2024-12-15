import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Button,
  Flex,
  Text,
  PopoverHeader,
  Badge,
} from '@chakra-ui/react';
import { BsStars } from 'react-icons/bs';

const AiSuggestions = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          pos={'fixed'}
          bottom={4}
          right={0}
          colorScheme="blue"
          zIndex={100}
        >
          <Badge pos={'absolute'} top={-1} left={-1} bg="red" color={'white'}>
            1
          </Badge>
          <BsStars style={{ marginRight: '.5rem' }} />
          Suggestions IA
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>La dernière suggestion IA</PopoverHeader>
        <PopoverBody>
          <Text>
            Vous pouvez échanger le cours de Java du 13 septembre 2024 de 9h à
            12h30 avec le cours de Cloud Computing du 16 septembre 2024 de 13h30
            à 17h.
          </Text>
          <Flex justify="space-between" mt={4}>
            <Button colorScheme="green">Accepter</Button>
            <Button colorScheme="red">Refuser</Button>
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default AiSuggestions;
