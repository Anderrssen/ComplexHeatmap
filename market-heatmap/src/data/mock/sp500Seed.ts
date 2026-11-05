/**
 * Seed-data til mock-universet "S&P 500".
 * Format pr. industri: "TICKER:Navn:markedsværdi i mia. USD" adskilt af "|".
 * Værdierne er omtrentlige og kun til realistisk fordeling i mock-tilstand.
 */
export type SeedTree = Record<string, Record<string, string>>;

export const SP500_SEED: SeedTree = {
  Technology: {
    Semiconductors:
      'NVDA:NVIDIA Corp:4300|AVGO:Broadcom Inc:1500|AMD:Advanced Micro Devices:330|QCOM:Qualcomm:185|TXN:Texas Instruments:170|MU:Micron Technology:140|INTC:Intel Corp:105|ADI:Analog Devices:115|MRVL:Marvell Technology:70|NXPI:NXP Semiconductors:55|MCHP:Microchip Technology:35|ON:ON Semiconductor:22|MPWR:Monolithic Power:40|SWKS:Skyworks Solutions:12',
    'Software - Infrastructure':
      'MSFT:Microsoft Corp:3800|ORCL:Oracle Corp:780|PLTR:Palantir Technologies:400|ADBE:Adobe Inc:150|PANW:Palo Alto Networks:130|CRWD:CrowdStrike:120|SNPS:Synopsys:75|FTNT:Fortinet:65|NET:Cloudflare:70|ZS:Zscaler:42|AKAM:Akamai:12|GEN:Gen Digital:18',
    'Software - Application':
      'CRM:Salesforce:250|INTU:Intuit:185|NOW:ServiceNow:195|APP:AppLovin:200|CDNS:Cadence Design:90|ADSK:Autodesk:65|WDAY:Workday:62|ROP:Roper Technologies:56|TTD:The Trade Desk:25|DDOG:Datadog:50|ANSS:Ansys:31|PTC:PTC Inc:24|TYL:Tyler Technologies:24|FICO:Fair Isaac:40',
    'Consumer Electronics': 'AAPL:Apple Inc:3700',
    'Semiconductor Equipment':
      'AMAT:Applied Materials:160|LRCX:Lam Research:150|KLAC:KLA Corp:120|TER:Teradyne:20|ENTG:Entegris:14',
    'Information Technology Services':
      'IBM:IBM:260|ACN:Accenture:160|FI:Fiserv:65|IT:Gartner:32|CTSH:Cognizant:36|EPAM:EPAM Systems:10|LDOS:Leidos:22|CDW:CDW Corp:23',
    'Communication Equipment':
      'CSCO:Cisco Systems:270|ANET:Arista Networks:180|MSI:Motorola Solutions:75|JNPR:Juniper Networks:12|ZBRA:Zebra Technologies:16',
    'Computer Hardware':
      'DELL:Dell Technologies:90|SMCI:Super Micro Computer:28|HPQ:HP Inc:26|HPE:Hewlett Packard Enterprise:30|NTAP:NetApp:23|STX:Seagate:40|WDC:Western Digital:35|PSTG:Pure Storage:25',
  },
  'Communication Services': {
    'Internet Content & Information':
      'GOOGL:Alphabet Inc:3400|META:Meta Platforms:1800|PINS:Pinterest:22|MTCH:Match Group:8',
    Entertainment:
      'NFLX:Netflix:500|DIS:Walt Disney:200|WBD:Warner Bros Discovery:45|LYV:Live Nation:33|TTWO:Take-Two Interactive:45|EA:Electronic Arts:50|FOXA:Fox Corp:25|PARA:Paramount:10',
    'Telecom Services':
      'TMUS:T-Mobile US:270|VZ:Verizon:175|T:AT&T:200|CMCSA:Comcast:130|CHTR:Charter Communications:50',
  },
  'Consumer Cyclical': {
    'Internet Retail': 'AMZN:Amazon.com:2400|BKNG:Booking Holdings:170|ABNB:Airbnb:80|EBAY:eBay:40|DASH:DoorDash:110',
    'Auto Manufacturers': 'TSLA:Tesla Inc:1400|GM:General Motors:60|F:Ford Motor:45',
    'Home Improvement Retail': 'HD:Home Depot:380|LOW:Lowe\'s:140',
    Restaurants: 'MCD:McDonald\'s:215|SBUX:Starbucks:95|CMG:Chipotle:55|YUM:Yum! Brands:40|DRI:Darden Restaurants:22|DPZ:Domino\'s Pizza:15',
    'Apparel Retail': 'TJX:TJX Companies:160|ROST:Ross Stores:50|LULU:Lululemon:22',
    'Footwear & Accessories': 'NKE:Nike Inc:100|DECK:Deckers Outdoor:16',
    'Travel Services': 'MAR:Marriott:75|HLT:Hilton:65|RCL:Royal Caribbean:85|CCL:Carnival:38|EXPE:Expedia:28|NCLH:Norwegian Cruise:10',
    'Specialty Retail': 'ORLY:O\'Reilly Automotive:80|AZO:AutoZone:65|TSCO:Tractor Supply:30|ULTA:Ulta Beauty:24|BBY:Best Buy:16',
    'Residential Construction': 'DHI:D.R. Horton:48|LEN:Lennar:33|PHM:PulteGroup:24|NVR:NVR Inc:24',
    'Resorts & Casinos': 'LVS:Las Vegas Sands:38|WYNN:Wynn Resorts:12|MGM:MGM Resorts:10',
  },
  'Consumer Defensive': {
    'Discount Stores': 'WMT:Walmart:820|COST:Costco:420|TGT:Target:45|DG:Dollar General:22|DLTR:Dollar Tree:20',
    'Household & Personal Products': 'PG:Procter & Gamble:360|CL:Colgate-Palmolive:65|KMB:Kimberly-Clark:42|EL:Estée Lauder:30|CHD:Church & Dwight:22|CLX:Clorox:16',
    'Beverages - Non-Alcoholic': 'KO:Coca-Cola:300|PEP:PepsiCo:200|MNST:Monster Beverage:65|KDP:Keurig Dr Pepper:45',
    'Beverages - Brewers & Spirits': 'STZ:Constellation Brands:25|TAP:Molson Coors:10|BF.B:Brown-Forman:13',
    Tobacco: 'PM:Philip Morris:240|MO:Altria:100',
    'Packaged Foods': 'MDLZ:Mondelez:85|GIS:General Mills:28|HSY:Hershey:38|KHC:Kraft Heinz:32|HRL:Hormel:13|K:Kellanova:28|SJM:J.M. Smucker:12|CAG:Conagra:10',
    'Grocery & Farm Products': 'KR:Kroger:45|SYY:Sysco:38|ADM:Archer-Daniels-Midland:28|TSN:Tyson Foods:20',
  },
  Healthcare: {
    'Drug Manufacturers': 'LLY:Eli Lilly:800|JNJ:Johnson & Johnson:450|ABBV:AbbVie:390|MRK:Merck & Co:220|PFE:Pfizer:140|BMY:Bristol-Myers Squibb:95|ZTS:Zoetis:70|VTRS:Viatris:11',
    Biotechnology: 'AMGN:Amgen:160|GILD:Gilead Sciences:145|VRTX:Vertex Pharmaceuticals:115|REGN:Regeneron:65|BIIB:Biogen:20|MRNA:Moderna:11|INCY:Incyte:15',
    'Medical Devices': 'ABT:Abbott Laboratories:230|ISRG:Intuitive Surgical:190|BSX:Boston Scientific:150|SYK:Stryker:145|MDT:Medtronic:120|EW:Edwards Lifesciences:45|DXCM:DexCom:28|ZBH:Zimmer Biomet:20|STE:Steris:23',
    'Healthcare Plans': 'UNH:UnitedHealth Group:310|ELV:Elevance Health:80|CI:Cigna:85|CVS:CVS Health:95|HUM:Humana:32|CNC:Centene:18|MOH:Molina:11',
    'Diagnostics & Research': 'TMO:Thermo Fisher:200|DHR:Danaher:150|A:Agilent:38|IQV:IQVIA:35|IDXX:IDEXX Labs:50|MTD:Mettler-Toledo:27|LH:Labcorp:21|DGX:Quest Diagnostics:20|WAT:Waters Corp:22',
    'Medical Distribution': 'MCK:McKesson:95|COR:Cencora:55|CAH:Cardinal Health:35',
    'Medical Care Facilities': 'HCA:HCA Healthcare:100|UHS:Universal Health Services:12|DVA:DaVita:11',
  },
  Financial: {
    'Banks - Diversified': 'JPM:JPMorgan Chase:830|BAC:Bank of America:390|WFC:Wells Fargo:270|C:Citigroup:180',
    'Banks - Regional': 'USB:U.S. Bancorp:75|PNC:PNC Financial:75|TFC:Truist Financial:58|MTB:M&T Bank:30|FITB:Fifth Third:28|HBAN:Huntington Bancshares:24|RF:Regions Financial:23|CFG:Citizens Financial:22|KEY:KeyCorp:20',
    'Credit Services': 'V:Visa Inc:670|MA:Mastercard:520|AXP:American Express:240|PYPL:PayPal:70|COF:Capital One:140|SYF:Synchrony:27',
    'Capital Markets': 'GS:Goldman Sachs:230|MS:Morgan Stanley:240|SCHW:Charles Schwab:170|IBKR:Interactive Brokers:100|RJF:Raymond James:33',
    'Asset Management': 'BLK:BlackRock:170|BX:Blackstone:200|KKR:KKR & Co:130|APO:Apollo Global:85|TROW:T. Rowe Price:23|BK:BNY Mellon:75|STT:State Street:32|NTRS:Northern Trust:24',
    'Insurance - Diversified': 'BRK.B:Berkshire Hathaway:1050|AIG:American International Group:45|ACGL:Arch Capital:35',
    'Insurance - Property & Casualty': 'PGR:Progressive:145|CB:Chubb:115|TRV:Travelers:60|ALL:Allstate:52|HIG:Hartford:35|CINF:Cincinnati Financial:23',
    'Insurance - Life': 'MET:MetLife:55|PRU:Prudential Financial:38|AFL:Aflac:58|PFG:Principal Financial:18',
    'Insurance Brokers': 'MMC:Marsh McLennan:105|AON:Aon plc:80|AJG:Arthur J. Gallagher:80|WTW:Willis Towers Watson:32|BRO:Brown & Brown:30',
    'Financial Data & Stock Exchanges': 'SPGI:S&P Global:160|MCO:Moody\'s:90|ICE:Intercontinental Exchange:95|CME:CME Group:95|NDAQ:Nasdaq Inc:50|MSCI:MSCI Inc:45|CBOE:Cboe Global:24|FDS:FactSet:15',
  },
  Industrials: {
    'Aerospace & Defense': 'GE:GE Aerospace:300|RTX:RTX Corp:210|BA:Boeing:160|LMT:Lockheed Martin:110|GD:General Dynamics:85|NOC:Northrop Grumman:80|TDG:TransDigm:75|HWM:Howmet Aerospace:75|LHX:L3Harris:50|TXT:Textron:14',
    'Specialty Industrial Machinery': 'ETN:Eaton:140|PH:Parker-Hannifin:90|EMR:Emerson Electric:75|ITW:Illinois Tool Works:75|ROK:Rockwell Automation:38|AME:Ametek:42|OTIS:Otis Worldwide:38|IR:Ingersoll Rand:33|XYL:Xylem:33|DOV:Dover:25',
    'Farm & Heavy Construction Machinery': 'CAT:Caterpillar:240|DE:Deere & Co:130|PCAR:Paccar:52|CMI:Cummins:55|WAB:Westinghouse Air Brake:35',
    Conglomerates: 'HON:Honeywell:135|MMM:3M Company:82',
    Railroads: 'UNP:Union Pacific:135|CSX:CSX Corp:65|NSC:Norfolk Southern:60',
    'Integrated Freight & Logistics': 'UPS:United Parcel Service:75|FDX:FedEx:58|ODFL:Old Dominion Freight:35|CHRW:C.H. Robinson:14|EXPD:Expeditors:16|JBHT:J.B. Hunt:15',
    'Specialty Business Services': 'CTAS:Cintas:85|ADP:Automatic Data Processing:120|PAYX:Paychex:50|VRSK:Verisk:40|CPRT:Copart:50|EFX:Equifax:30',
    'Waste Management': 'WM:Waste Management:90|RSG:Republic Services:72|ROL:Rollins:28',
    'Airlines': 'DAL:Delta Air Lines:38|UAL:United Airlines:32|LUV:Southwest Airlines:18',
    'Electrical Equipment': 'GEV:GE Vernova:170|VRT:Vertiv:55|HUBB:Hubbell:22|AOS:A.O. Smith:10',
    'Building Products': 'TT:Trane Technologies:95|CARR:Carrier Global:60|JCI:Johnson Controls:70|LII:Lennox:20|MAS:Masco:15',
    'Engineering & Construction': 'PWR:Quanta Services:55|J:Jacobs Solutions:17|EME:EMCOR:28',
    'Industrial Distribution': 'GWW:W.W. Grainger:50|FAST:Fastenal:47|URI:United Rentals:55',
  },
  Energy: {
    'Oil & Gas Integrated': 'XOM:Exxon Mobil:480|CVX:Chevron:270',
    'Oil & Gas E&P': 'COP:ConocoPhillips:115|EOG:EOG Resources:65|OXY:Occidental Petroleum:42|FANG:Diamondback Energy:42|DVN:Devon Energy:22|EQT:EQT Corp:32|APA:APA Corp:7|CTRA:Coterra Energy:19',
    'Oil & Gas Midstream': 'WMB:Williams Cos:70|KMI:Kinder Morgan:60|OKE:ONEOK:50|TRGP:Targa Resources:38',
    'Oil & Gas Refining & Marketing': 'MPC:Marathon Petroleum:55|PSX:Phillips 66:52|VLO:Valero Energy:48',
    'Oil & Gas Equipment & Services': 'SLB:Schlumberger:50|BKR:Baker Hughes:42|HAL:Halliburton:20',
  },
  Utilities: {
    'Utilities - Regulated Electric': 'NEE:NextEra Energy:155|SO:Southern Co:100|DUK:Duke Energy:95|AEP:American Electric Power:58|D:Dominion Energy:50|EXC:Exelon:45|XEL:Xcel Energy:42|PCG:PG&E:35|ED:Consolidated Edison:35|ETR:Entergy:40|PPL:PPL Corp:26|EIX:Edison International:22|FE:FirstEnergy:25',
    'Utilities - Independent Power Producers': 'CEG:Constellation Energy:110|VST:Vistra:65|NRG:NRG Energy:30',
    'Utilities - Diversified': 'SRE:Sempra:55|PEG:Public Service Enterprise:42|WEC:WEC Energy:35|CNP:CenterPoint:24',
    'Utilities - Regulated Water': 'AWK:American Water Works:27',
  },
  'Real Estate': {
    'REIT - Specialty': 'AMT:American Tower:95|EQIX:Equinix:80|CCI:Crown Castle:45|DLR:Digital Realty:58|SBAC:SBA Communications:22|IRM:Iron Mountain:30|WY:Weyerhaeuser:20',
    'REIT - Industrial': 'PLD:Prologis:105|PSA:Public Storage:52|EXR:Extra Space Storage:32',
    'REIT - Retail': 'SPG:Simon Property:62|O:Realty Income:52|KIM:Kimco Realty:15|REG:Regency Centers:13',
    'REIT - Healthcare Facilities': 'WELL:Welltower:105|VTR:Ventas:30',
    'REIT - Residential': 'AVB:AvalonBay:30|EQR:Equity Residential:26|INVH:Invitation Homes:19|MAA:Mid-America Apartment:17|ESS:Essex Property:17',
    'Real Estate Services': 'CBRE:CBRE Group:45|CSGP:CoStar Group:30',
  },
  'Basic Materials': {
    'Specialty Chemicals': 'LIN:Linde plc:215|SHW:Sherwin-Williams:85|APD:Air Products:62|ECL:Ecolab:72|PPG:PPG Industries:25|IFF:International Flavors & Fragrances:18|ALB:Albemarle:10',
    'Chemicals': 'DOW:Dow Inc:17|LYB:LyondellBasell:17|CE:Celanese:6',
    'Agricultural Inputs': 'CTVA:Corteva:45|CF:CF Industries:15|MOS:Mosaic:11',
    'Copper & Gold': 'FCX:Freeport-McMoRan:65|NEM:Newmont:90',
    Steel: 'NUE:Nucor:33|STLD:Steel Dynamics:21',
    'Building Materials': 'VMC:Vulcan Materials:37|MLM:Martin Marietta:36',
    'Packaging & Containers': 'BALL:Ball Corp:15|PKG:Packaging Corp of America:19|AMCR:Amcor:14|IP:International Paper:25|SW:Smurfit Westrock:24',
  },
};
