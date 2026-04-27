import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StellarAuth } from './StellarAuth';
import { useAuthStore } from '@/lib/stores/auth-store';

// Mock the auth store
jest.mock('@/lib/stores/auth-store');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock Freighter API
const mockFreighter = {
  isConnected: jest.fn(),
  connect: jest.fn(),
  getAddress: jest.fn(),
  signTransaction: jest.fn(),
  getNetwork: jest.fn(),
};

// Mock window.freighter
Object.defineProperty(window, 'freighter', {
  value: mockFreighter,
  writable: true,
});

// Mock axios
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('StellarAuth Component', () => {
  const mockStellarLogin = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuthStore.mockReturnValue({
      stellarLogin: mockStellarLogin,
      isLoading: false,
      error: null,
    } as any);

    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: 'test_token',
        refresh_token: 'test_refresh',
        user: {
          id: 'user_id',
          stellar_address: 'GD5DJQDQKG6GSUWQJQGQKQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q',
          role: 'USER',
          full_name: 'Test User',
        },
      },
    });
  });

  const renderComponent = () => {
    return render(
      <StellarAuth
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );
  };

  describe('Initial State', () => {
    it('should render connect wallet button initially', () => {
      renderComponent();
      
      expect(screen.getByText('Connect Freighter Wallet')).toBeInTheDocument();
      expect(screen.queryByText('Connected:')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign in with Stellar')).not.toBeInTheDocument();
    });

    it('should show loading state when auth store is loading', () => {
      mockUseAuthStore.mockReturnValue({
        stellarLogin: mockStellarLogin,
        isLoading: true,
        error: null,
      } as any);

      renderComponent();
      
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('should display error message when auth store has error', () => {
      mockUseAuthStore.mockReturnValue({
        stellarLogin: mockStellarLogin,
        isLoading: false,
        error: 'Authentication failed',
      } as any);

      renderComponent();
      
      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Wallet Connection', () => {
    it('should handle successful wallet connection', async () => {
      mockFreighter.isConnected.mockResolvedValue(true);
      mockFreighter.getAddress.mockResolvedValue('GD5DJQDQKG6GSUWQJQGQKQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q');

      renderComponent();
      
      const connectButton = screen.getByText('Connect Freighter Wallet');
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText('Connected: GD5DJQDQKG6GSUWQJQGQKQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q')).toBeInTheDocument();
        expect(screen.getByText('Sign in with Stellar')).toBeInTheDocument();
      });

      expect(mockFreighter.connect).toHaveBeenCalled();
      expect(mockFreighter.getAddress).toHaveBeenCalled();
    });

    it('should handle wallet connection failure', async () => {
      mockFreighter.isConnected.mockResolvedValue(false);
      mockFreighter.connect.mockRejectedValue(new Error('Connection failed'));

      renderComponent();
      
      const connectButton = screen.getByText('Connect Freighter Wallet');
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to connect wallet. Please try again.')).toBeInTheDocument();
      });

      expect(mockFreighter.connect).toHaveBeenCalled();
    });

    it('should handle Freighter not installed', async () => {
      // Remove Freighter from window
      delete (window as any).freighter;

      renderComponent();
      
      const connectButton = screen.getByText('Connect Freighter Wallet');
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText('Freighter wallet is not installed. Please install it to continue.')).toBeInTheDocument();
        expect(screen.getByText('Install Freighter')).toBeInTheDocument();
      });
    });

    it('should handle getting wallet address failure', async () => {
      mockFreighter.isConnected.mockResolvedValue(true);
      mockFreighter.connect.mockResolvedValue(true);
      mockFreighter.getAddress.mockRejectedValue(new Error('Failed to get address'));

      renderComponent();
      
      const connectButton = screen.getByText('Connect Freighter Wallet');
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to get wallet address. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Stellar Authentication', () => {
    beforeEach(async () => {
      // Setup successful wallet connection first
      mockFreighter.isConnected.mockResolvedValue(true);
      mockFreighter.getAddress.mockResolvedValue('GD5DJQDQKG6GSUWQJQGQKQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q');
      mockFreighter.signTransaction.mockResolvedValue('signed_transaction_xdr');

      renderComponent();
      
      const connectButton = screen.getByText('Connect Freighter Wallet');
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText('Sign in with Stellar')).toBeInTheDocument();
      });
    });

    it('should handle successful Stellar authentication', async () => {
      const signInButton = screen.getByText('Sign in with Stellar');
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(mockStellarLogin).toHaveBeenCalledWith('GD5DJQDQKG6GSUWQJQGQKQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q');
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should handle authentication failure', async () => {
      mockStellarLogin.mockRejectedValue(new Error('Authentication failed'));

      const signInButton = screen.getByText('Sign in with Stellar');
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Authentication failed');
      });
    });

    it('should show loading state during authentication', async () => {
      mockUseAuthStore.mockReturnValue({
        stellarLogin: mockStellarLogin,
        isLoading: true,
        error: null,
      } as any);

      renderComponent();
      
      // Simulate wallet connection
      mockFreighter.isConnected.mockResolvedValue(true);
      mockFreighter.getAddress.mockResolvedValue('GD5DJQDQKG6GSUWQJQGQKQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q');

      const connectButton = screen.getByText('Connect Freighter Wallet');
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
      });
    });
  });

  describe('Disconnect Wallet', () => {
    beforeEach(async () => {
      // Setup successful wallet connection first
      mockFreighter.isConnected.mockResolvedValue(true);
      mockFreighter.getAddress.mockResolvedValue('GD5DJQDQKG6GSUWQJQGQKQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q');

      renderComponent();
      
      const connectButton = screen.getByText('Connect Freighter Wallet');
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText('Sign in with Stellar')).toBeInTheDocument();
      });
    });

    it('should disconnect wallet when disconnect button is clicked', async () => {
      const disconnectButton = screen.getByText('Disconnect');
      fireEvent.click(disconnectButton);

      await waitFor(() => {
        expect(screen.getByText('Connect Freighter Wallet')).toBeInTheDocument();
        expect(screen.queryByText('Connected:')).not.toBeInTheDocument();
        expect(screen.queryByText('Sign in with Stellar')).not.toBeInTheDocument();
      });
    });
  });

  describe('Network Validation', () => {
    it('should validate network configuration', async () => {
      mockFreighter.getNetwork.mockResolvedValue('public');
      mockFreighter.isConnected.mockResolvedValue(true);
      mockFreighter.getAddress.mockResolvedValue('GD5DJQDQKG6GSUWQJQGQKQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q');

      renderComponent();
      
      const connectButton = screen.getByText('Connect Freighter Wallet');
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText('Connected: GD5DJQDQKG6GSUWQJQGQKQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q')).toBeInTheDocument();
      });

      expect(mockFreighter.getNetwork).toHaveBeenCalled();
    });

    it('should handle network mismatch', async () => {
      mockFreighter.getNetwork.mockResolvedValue('mainnet');
      mockFreighter.isConnected.mockResolvedValue(true);
      mockFreighter.getAddress.mockResolvedValue('GD5DJQDQKG6GSUWQJQGQKQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q');

      renderComponent();
      
      const connectButton = screen.getByText('Connect Freighter Wallet');
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/Network mismatch/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle transaction signing failure', async () => {
      mockFreighter.isConnected.mockResolvedValue(true);
      mockFreighter.getAddress.mockResolvedValue('GD5DJQDQKG6GSUWQJQGQKQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q');
      mockFreighter.signTransaction.mockRejectedValue(new Error('User rejected signing'));

      renderComponent();
      
      // Connect wallet
      const connectButton = screen.getByText('Connect Freighter Wallet');
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText('Sign in with Stellar')).toBeInTheDocument();
      });

      // Try to sign in
      const signInButton = screen.getByText('Sign in with Stellar');
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('User rejected signing');
      });
    });

    it('should handle API errors during authentication', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      mockFreighter.isConnected.mockResolvedValue(true);
      mockFreighter.getAddress.mockResolvedValue('GD5DJQDQKG6GSUWQJQGQKQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q');

      renderComponent();
      
      const connectButton = screen.getByText('Connect Freighter Wallet');
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText('Sign in with Stellar')).toBeInTheDocument();
      });

      const signInButton = screen.getByText('Sign in with Stellar');
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('API Error');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderComponent();
      
      const connectButton = screen.getByRole('button', { name: 'Connect Freighter Wallet' });
      expect(connectButton).toBeInTheDocument();
      expect(connectButton).toHaveAttribute('aria-busy', 'false');
    });

    it('should announce errors to screen readers', async () => {
      mockUseAuthStore.mockReturnValue({
        stellarLogin: mockStellarLogin,
        isLoading: false,
        error: 'Authentication failed',
      } as any);

      renderComponent();
      
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent('Authentication failed');
    });

    it('should show loading state with proper ARIA attributes', () => {
      mockUseAuthStore.mockReturnValue({
        stellarLogin: mockStellarLogin,
        isLoading: true,
        error: null,
      } as any);

      renderComponent();
      
      const loadingButton = screen.getByRole('button', { name: /loading/i });
      expect(loadingButton).toHaveAttribute('aria-busy', 'true');
    });
  });
});
