'use client';

import {
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Text,
  Drawer,
  DrawerContent,
  useDisclosure,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Badge,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import {
  FiHome,
  FiMenu,
  FiBell,
  FiChevronDown,
  FiCalendar,
  FiSettings,
} from 'react-icons/fi';
import { FaBusinessTime } from 'react-icons/fa';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '../context/user-context';

const getLinkItems = (role) => {
  // admin | teacher | student
  switch (role) {
    case 'admin':
      return [
        { name: 'Accueil', icon: FiHome, href: '/' },
        { name: 'Gérer les plannings', icon: FiCalendar, href: '/plannings' },
        {
          name: 'Gestion avancée',
          icon: FiSettings,
          href: '/advanced-management',
        },
      ];
    case 'teacher':
      return [
        { name: 'Mon Planning', icon: FiCalendar, href: '/teacher-planning' },
        {
          name: 'Mes disponibilités',
          icon: FaBusinessTime,
          href: '/teacher-availabilities',
        },
      ];
    case 'student':
      return [
        { name: 'Mon Planning', icon: FiCalendar, href: '/student-planning' },
      ];
    default:
      return [];
  }
};

const SidebarContent = ({ onClose, ...rest }) => {
  const { user } = useUser();
  const LinkItems = getLinkItems(user?.role);
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" my={4} fontWeight="bold">
          School Planning
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem key={link.name} icon={link.icon} href={link.href}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};

SidebarContent.propTypes = {
  onClose: PropTypes.func.isRequired,
};

const NavItem = ({ icon, children, ...rest }) => {
  const { href } = rest;
  return (
    <Box
      as="a"
      href={href}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: 'gray.400',
          color: 'white',
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Box>
  );
};
NavItem.propTypes = {
  icon: PropTypes.elementType,
  children: PropTypes.node,
};

const MobileNav = ({ onOpen, ...rest }) => {
  const navigate = useNavigate();
  const { logout, user } = useUser();

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={'white'}
      borderBottomWidth="1px"
      borderBottomColor={'gray.200'}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
      >
        School Planning
      </Text>

      <HStack spacing={{ base: '0', md: '6' }}>
        <IconButton
          size="lg"
          variant="ghost"
          aria-label="open menu"
          icon={<FiBell />}
        />
        <Flex alignItems={'center'}>
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: 'none' }}
            >
              <HStack>
                <Avatar
                  size={'sm'}
                  src={
                    'https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
                  }
                />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm" m={0} fontWeight={'semibold'}>
                    {user?.name}
                  </Text>
                  <Badge
                    fontSize="xs"
                    colorScheme={user?.role === 'admin' ? 'red' : 'green'}
                    m={0}
                  >
                    {user?.role}
                  </Badge>
                </VStack>
                <Box display={{ base: 'none', md: 'flex' }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList bg={'white'} borderColor={'gray.200'}>
              <MenuItem>Profil</MenuItem>
              <MenuDivider />
              <MenuItem
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Se déconnecter
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};

MobileNav.propTypes = {
  onOpen: PropTypes.func.isRequired,
};

const DashboardLayout = () => {
  const { user } = useUser();

  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Box minH="100vh" bg={'gray.100'}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
