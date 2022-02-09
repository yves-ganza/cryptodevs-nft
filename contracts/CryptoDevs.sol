// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable{
 string _baseTokenURI;
 uint256 public _price = 0.01 ether;
 bool public _paused;

 uint256 _maxTokenIds = 20;
 uint256 tokenIds =  0;

 IWhitelist whitelist;

 bool public presaleStarted;

 uint256 presaleEnded;

 modifier onlyWhenNotPaused {
     require(!_paused, "Contract currently paused");
     _;
 }

 constructor(string memory baseURI, address whitelistContract) ERC721("CryptoDevs", "CD") {
     _baseTokenURI  = baseURI;
     whitelist = IWhitelist(whitelistContract);
 }

 function startPresale() public onlyOwner {
     presaleStarted = true;
     presaleEnded = block.timestamp + 5 minutes;
 }

 function presaleMint() public payable onlyWhenNotPaused {
     require(whitelist.whitelistedAddresses(msg.sender), "Your are not whitelisted");
     require(presaleStarted && block.timestamp < presaleEnded, "Presale is not active");
     require(tokenIds < _maxTokenIds, "Maximum Crypto Devs supply reached");
     require(msg.value >= _price, "Unsufficient amount of Ether sent");
     tokenIds += 1;
     _safeMint(msg.sender, tokenIds);
 }

 function mint() public payable onlyWhenNotPaused {
     require(presaleStarted && block.timestamp >= presaleEnded, "Presale has not ended yet");
     require(tokenIds < _maxTokenIds, "Maximum Crypto Devs supply reached");
     require(msg.value >= _price, "Unsufficient amount of Ether sent");
     tokenIds += 1;
     _safeMint(msg.sender, tokenIds);
 }

 // Overrides @openzeppelin's baseURI function
 function _baseURI() internal view virtual override returns(string memory){
     return _baseTokenURI;
 }

 function setPaused(bool val) public onlyOwner {
     _paused = val;
 }

 function withdraw() public onlyOwner {
     address _owner = owner();
     uint256 amount = address(this).balance;
     (bool sent,) = _owner.call{value: amount}("");
     require(sent, "Failed to withdraw Ether");
 }

 receive() external payable {}
 fallback() external payable {}

}