// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.5.0) (token/ERC1155/presets/ERC1155PresetMinterPauser.sol)

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

//import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @dev {ERC1155} token, including:
 *
 *  - ability for holders to burn (destroy) their tokens
 *  - a minter role that allows for token minting (creation)
 *  - a pauser role that allows to stop all token transfers
 *
 * This contract uses {AccessControl} to lock permissioned functions using the
 * different roles - head to its documentation for details.
 *
 * The account that deploys the contract will be granted the minter and pauser
 * roles, as well as the default admin role, which will let it grant both minter
 * and pauser roles to other accounts.
 *
 * _Deprecated in favor of https://wizard.openzeppelin.com/[Contracts Wizard]._
 */
contract OAZIZ is
    Context,
    AccessControlEnumerable,
    ERC1155Burnable,
    ERC1155Pausable
{
    using Strings for uint256;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // tracks the total number of minted token
    //uint256 private _currentTokenID = 0;
    //mapping(string => uint256) public idmap;
    //mapping(uint256 => string) public lookupmap;

    // using Strings for uint256;
    mapping(address => uint256) public whitelists;
    mapping(address => uint256) public balancesOfAddress;

    mapping(address => uint256[]) public balanceOwns;

    address public ownerAddress;
    string public baseURI;

    using Counters for Counters.Counter;
    Counters.Counter private tokenCounter;

    // mapping (uint256 => string) private _tokenURIs;

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, and `PAUSER_ROLE` to the account that
     * deploys the contract.
     */
    constructor(string memory walletAddr) ERC1155(walletAddr) {
        ownerAddress = _msgSender();
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
    }

    /**
     * @dev Creates `amount` new tokens for `to`, of token type `id`.
     *
     * See {ERC1155-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the `MINTER_ROLE`.
     */
    function mint(address to, bytes memory data)
        public
        virtual
        returns (uint256)
    {
        require(
            whitelists[msg.sender] > balancesOfAddress[msg.sender],
            "You already minted all"
        );

        //_currentTokenID = _currentTokenID + 1;
        //idmap[cid] = _currentTokenID;
        //lookupmap[_currentTokenID] = cid;
        uint256 newItemId = tokenCounter.current();
        balancesOfAddress[msg.sender]++;
        balanceOwns[msg.sender].push(newItemId);
        _mint(to, newItemId, 1, data);
        tokenCounter.increment();
        return newItemId;
    }

    /**
     * @notice Override ERC1155 base uri
     * @param tokenId ID of token
     * @return Correctly formatted IPFS URI for token
     */
    function uri(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        string memory baseURI1 = _baseURI();
        return
            bytes(baseURI1).length > 0
                ? string(abi.encodePacked(baseURI1, tokenId.toString()))
                : "";
        //return string(abi.encodePacked(super.uri(id), lookupmap[id]));
    }

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] variant of {mint}.
     */
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual {
        require(
            hasRole(MINTER_ROLE, _msgSender()),
            "ERC1155PresetMinterPauser: must have minter role to mint"
        );

        _mintBatch(to, ids, amounts, data);
    }

    /**
     * @dev Pauses all token transfers.
     *
     * See {ERC1155Pausable} and {Pausable-_pause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function pause() public virtual {
        require(
            hasRole(PAUSER_ROLE, _msgSender()),
            "ERC1155PresetMinterPauser: must have pauser role to pause"
        );
        _pause();
    }

    /**
     * @dev Unpauses all token transfers.
     *
     * See {ERC1155Pausable} and {Pausable-_unpause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function unpause() public virtual {
        require(
            hasRole(PAUSER_ROLE, _msgSender()),
            "ERC1155PresetMinterPauser: must have pauser role to unpause"
        );
        _unpause();
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerable, ERC1155)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155, ERC1155Pausable) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function addWinnerAddress(address[] memory winners) external {
        require(
            msg.sender == ownerAddress,
            "onlyOwner can add whitelist addres"
        );
        uint256 i = 0;
        for (i = 0; i < winners.length; i++) {
            whitelists[winners[i]]++;
        }
    }

    function setBaseURI(string memory _base) external {
        require(msg.sender == ownerAddress, "onlyOwner can set BaseURI");
        baseURI = _base;
    }

    function isWhitelisted(address _address) public view returns (bool) {
        return whitelists[_address] > 0;
    }

    function _baseURI() internal view virtual returns (string memory) {
        return baseURI;
    }
}
